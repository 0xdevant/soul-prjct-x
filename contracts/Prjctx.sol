//SPDX-License-Identifier: MIT

pragma solidity ^0.8.4;

import "erc721a/contracts/ERC721A.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

error InvalidMintAmount();
error MaxSupplyExceeded();
error MintPaused();
error WhitelistMintNotOpen();
error NormalMintNotOpen();
error MerkleProofInvalid();

contract PRJCTX is ERC721A, Ownable {
    using Strings for uint256;

    string public uriPrefix = "";
    string public uriSuffix = ".json";
    string public hiddenMetadataUri;

    uint256 public cost = 0.08 ether;
    uint256 public maxSupply = 2022;
    uint256 public maxMintAmountPerTx = 20;

    bool public paused = true;
    bool public revealed = false;
    bool public onlyWhitelisted = false;

    bytes32 public merkleRoot;

    mapping(address => bool) public whitelistClaimed;

    constructor() ERC721A("PRJCT-X", "PRJCTX") {
        setHiddenMetadataUri("ipfs://__CID__/hidden.json");
    }

    modifier mintCompliance(uint256 _mintAmount) {
        if (_mintAmount <= 0 && _mintAmount > maxMintAmountPerTx) {
            revert InvalidMintAmount();
        }
        if (totalSupply() + _mintAmount > maxSupply) {
            revert MaxSupplyExceeded();
        }
        _;
    }

    /**
     * @dev merkleRoot will need to be set by initializing a merkle tree in order to verify the proof
     * Check if the merkleproof generated from the user's wallet address
     * is contained in the leafs of the merkle tree of whitelist
     */
    function whiteListMint(bytes32[] calldata _merkleProof, uint256 _mintAmount)
        public
        payable
        mintCompliance(_mintAmount)
    {
        if (paused) revert MintPaused();
        if (!onlyWhitelisted) revert WhitelistMintNotOpen();

        require(
            whitelistClaimed[msg.sender] == false,
            "Address has already claimed WL"
        );

        bytes32 leaf = keccak256(abi.encodePacked(msg.sender));
        if (MerkleProof.verify(_merkleProof, merkleRoot, leaf) == false) {
            revert MerkleProofInvalid();
        }
        whitelistClaimed[msg.sender] = true;
        if (msg.sender != owner()) {
            require(msg.value >= cost * _mintAmount, "Insufficient funds");
        }
        _safeMint(msg.sender, _mintAmount);
    }

    function mint(uint256 _mintAmount)
        external
        payable
        mintCompliance(_mintAmount)
    {
        if (paused) revert MintPaused();
        if (onlyWhitelisted) revert NormalMintNotOpen();
        if (msg.sender != owner()) {
            require(msg.value >= cost * _mintAmount, "Insufficient funds");
        }
        _safeMint(msg.sender, _mintAmount);
    }

    function getOnlyWhiteListedState() public view returns (bool) {
        return onlyWhitelisted;
    }

    function walletOfOwner(address _owner)
        public
        view
        returns (uint256[] memory)
    {
        uint256 ownerTokenCount = balanceOf(_owner);
        uint256[] memory ownedTokenIds = new uint256[](ownerTokenCount);
        uint256 currentTokenId = 1;
        uint256 ownedTokenIndex = 0;

        while (
            ownedTokenIndex < ownerTokenCount && currentTokenId <= maxSupply
        ) {
            address currentTokenOwner = ownerOf(currentTokenId);

            if (currentTokenOwner == _owner) {
                ownedTokenIds[ownedTokenIndex] = currentTokenId;

                ownedTokenIndex++;
            }

            currentTokenId++;
        }

        return ownedTokenIds;
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        virtual
        override
        returns (string memory)
    {
        require(
            _exists(_tokenId),
            "ERC721AMetadata: URI query for nonexistent token"
        );

        if (revealed == false) {
            return hiddenMetadataUri;
        }

        string memory currentBaseURI = _baseURI();
        return
            bytes(currentBaseURI).length > 0
                ? string(
                    abi.encodePacked(
                        currentBaseURI,
                        _tokenId.toString(),
                        uriSuffix
                    )
                )
                : "";
    }

    //only owner
    /**
     * use Merkle Tree to verify if wallet address is in the whitelist
     */
    function setMerkleRoot(bytes32 _merkleRoot) public onlyOwner {
        merkleRoot = _merkleRoot;
    }

    function setRevealed(bool _state) public onlyOwner {
        revealed = _state;
    }

    function setCost(uint256 _cost) public onlyOwner {
        cost = _cost;
    }

    function setMaxMintAmountPerTx(uint256 _maxMintAmountPerTx)
        public
        onlyOwner
    {
        maxMintAmountPerTx = _maxMintAmountPerTx;
    }

    function setHiddenMetadataUri(string memory _hiddenMetadataUri)
        public
        onlyOwner
    {
        hiddenMetadataUri = _hiddenMetadataUri;
    }

    function setUriPrefix(string memory _uriPrefix) public onlyOwner {
        uriPrefix = _uriPrefix;
    }

    function setUriSuffix(string memory _uriSuffix) public onlyOwner {
        uriSuffix = _uriSuffix;
    }

    function setPaused(bool _state) public onlyOwner {
        paused = _state;
    }

    function setOnlyWhitelisted(bool _state) public onlyOwner {
        onlyWhitelisted = _state;
    }

    function mintForAddress(uint256 _mintAmount, address _receiver)
        public
        mintCompliance(_mintAmount)
        onlyOwner
    {
        _safeMint(_receiver, _mintAmount);
    }

    function withdraw() public payable onlyOwner {
        (bool success, ) = payable(owner()).call{value: address(this).balance}(
            ""
        );
        require(success, "Failed to withdraw");
    }

    // internal
    function _baseURI() internal view virtual override returns (string memory) {
        return uriPrefix;
    }
}

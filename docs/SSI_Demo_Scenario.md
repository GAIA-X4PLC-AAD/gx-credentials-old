# Demo: SSI Scenario

The W3C standards and especially the DID methods leave plenty of opportunities to prove identities and are the framework we operate in. But for a demonstration purpose, we would like to write down a specific SSI scenario that complements the Sensor Model Tokenization Demo. Through this scenario, the existing demo should be extended by the hereby defined roles.

## Assumption

- Tezos is AN accepted registry
- We use the public test network "ithacanet"
- ASCS runs the email server and is the main issuer of the email credential
- Issuers are registered in a "Trusted Issuer Registry" like Gaia-X Registry (service providers would require the issuer of a vc to be listed in the registry)

## Roles

- Alice: Manager of a specific "Data Space" which is the "ENVITED"
- Bob: BMW employee who wants to have access to a Sensor Model in the "ENVITED" data space
- Charles: A Continental employee who wants to tokenize a Sensor Model and is responsible to make it available to BMW through "ENVITED"(upload, etc) -> connecting part to the other Sensor Model Tokenization Demo

## Scenario

1. Bob received a BMW email address with a "bmw.de" domain
2. Bob has a role and some additional information about himself he testifies (Name, Company, Department, Role)
3. Bob wants to get a vc to prove his personal info (vc#0) and another one to prove that he owns a bmw.de email address (vc#1). While vc#0 is self-attested, vc#1 is issued by ASCS. 
4. He presents his vc to "ENVITED" and Alice does the verification (i.e. checks if the issuer (did) is listed in trust anchor, checks Bob's did, checks the claims in the vc) // NOT COMPLETE

# TzProfiles

For establishing this scenario, we have decided to use TzProfiles from Spruce. TzProfiles enables Tezos users to associate their online identity with their Tezos account. By default, it supports creating credentials such as Twitter, GitHub, Discord, DNS, and Basic Profile. Once you have prepared your credentials, TzProfiles enables you to deploy them. While the actual credential content is stored on a distributed storage (Kepler by Spruce), the identifier of where the credential is located on Kepler is stored on a smart contract. Every TzProfiles user has their own contract that stores their vc identifier data. When you decide to add a new credential with TzProfiles, the contract storage is only extended (a new contract is not deployed).

The Basic Profile credential allows one to self-attest their personal info regarding alias, website, description, and logo. Since this is pretty similar to what we need for vc#0, we have extended this credential to support our requirements. For issuing vc#1, we have added a new credential type to TzProfiles called Email Verification.

Besides extending the supported credentials, we have also enabled ithacanet connection with TzProfiles. All of these changes and more can be found under our TzProfiles fork repository https://github.com/boz1/gxprofiles.


# Conceptual Open Questions

- The issuer could auto-check self-attestation claims like "is the company name part of the email domain" when issuing a vc -> Future
- What about circular dependencies?! Registries?
- What is the "initialization procedure"
- Should Bob present ASCS a verifiable presentation which is a combination of vc#0 and vc#1
- vcs are now stored on a distributed storage that is accessible by anyone. Is this safe?
- Most of the "finance wallets" on Tezos don't support credentials (i.e. You don't see anything about the credentials you own on your wallet. You have to specifically visit your smart contract and access the vc from there). Does Spruce have a wallet solution for this besides Credible which is a mobile wallet?
- Can tzprofiles search profile feature be used for verification?
- Issuer did is always did:web:tzprofiles.com (except self-attested vcs). This must be issuer specific.

# Implementation-related Open Questions

- Witness email.rs not complete & worker not working
- Email vc verification not working (skipped for now)
- What is stored on the email server? Is sending challenges in plaintext safe?
- Currently using Redis to store credentials {key=>pkh+email, value=>challenge} on the Email server
- Open TODOs in the codebase

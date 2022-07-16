import { v4 as uuid } from 'uuid';
import { alert } from 'src/store';
import { RequestSignPayloadInput, SigningType } from '@airgap/beacon-sdk';
import {
  completeIssueCredential,
  JWKFromTezos,
  prepareIssueCredential,
  verifyCredential,
} from 'didkit-wasm';

export const generateSignature = async (email, userData) => {
  const did = `did:pkh:tz:${userData.account.address}`;
  // TODO: Update credential schema
  const credential = {
    "@context": [
      "https://www.w3.org/2018/credentials/v1",
      {
        sameAs: "http://schema.org/sameAs",
        EmailVerification: "https://tzprofiles.com/EmailVerification",
        EmailVerificationMessage: {
          "@id": "https://tzprofiles.com/EmailVerificationMessage",
          "@context": {
            "@version": 1.1,
            "@protected": true,
            timestamp: {
              "@id": "https://tzprofiles.com/timestamp",
              "@type": "http://www.w3.org/2001/XMLSchema#dateTime",
            },
          },
        },
      },
    ],
    issuanceDate: new Date().toISOString(),
    id: "urn:uuid:" + uuid(),
    type: ["VerifiableCredential", "EmailVerification"],
    credentialSubject: {
      id: "did:pkh:tz:" + userData.account.address,
      sameAs: "email:" + email,
    },
    issuer: "did:web:tzprofiles.com", // TODO: Change it to ASCS did maybe?
  };

  let credentialString = JSON.stringify(credential);
  const proofOptions = {
    verificationMethod: did + '#TezosMethod2021',
    proofPurpose: 'assertionMethod',
  };

  const publicKey = userData.account.publicKey;
  const publicKeyJwkString = await JWKFromTezos(publicKey);
  let prepStr = await prepareIssueCredential(
    credentialString,
    JSON.stringify(proofOptions),
    publicKeyJwkString
  );
  const preparation = JSON.parse(prepStr);
  const { signingInput } = preparation;
  const micheline = signingInput && signingInput.micheline;
  if (!micheline) {
    throw new Error('Expected micheline signing input');
  }
  return { micheline, credentialString, prepStr };
};

export const signEmail = async (userData, email, signature) => {
  try {
    const { credentialString, prepStr} = await generateSignature(
      email,
      userData
    );
    let vcStr = await completeIssueCredential(
      credentialString,
      prepStr,
      signature
    );


    // TODO: Verify VC
    // const verifyOptionsString = '{}';
    // const verifyResult = JSON.parse(
    //   await verifyCredential(vcStr, verifyOptionsString)
    // );
    // if (verifyResult.errors.length > 0) {
    //   const errorMessage = `Unable to verify credential: ${verifyResult.errors.join(
    //     ', '
    //   )}`;
    //   alert.set({
    //     message: errorMessage,
    //     variant: 'error',
    //   });
    //   throw new Error(errorMessage);
    // }

    alert.set({
      message: "You've completed your Email Verification successfully!",
      variant: 'success',
    });

    return vcStr;
  } catch (e) {
    alert.set({
      message: e.message || JSON.stringify(e),
      variant: 'error',
    });
    throw e;
  }
};

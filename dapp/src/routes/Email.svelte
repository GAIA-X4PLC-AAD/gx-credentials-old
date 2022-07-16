<script lang="ts">
  import {
    BasePage,
    CopyButton,
    Input,
    PrimaryButton,
    VerificationDescription,
    VerificationStep,
    CopyTextArea,
  } from 'components';
  import { alert, claimsStream, wallet, userData } from 'src/store';
  import {
    contentToDraft,
    getFullAttestation,
    getPreparedUnsignedAttestation,
  } from 'src/helpers';
  import type { ClaimMap } from 'src/helpers';
  import { useNavigate } from 'svelte-navigator';
  import { signEmail } from 'src/email';
  import { MAIL_SERVER_URL } from '../constants/server';

  let navigate = useNavigate();

  let readClaimMap: ClaimMap;
  claimsStream.subscribe((x) => {
    readClaimMap = x;
  });

  let display = readClaimMap?.email?.display;

  let email: string = '';
  let challenge: string = '';

  let currentStep: number = 1;
  let lock: boolean = false;
  let emailClaim: string = '';
  let emailMessage: string = '';

  const next = (func: () => Promise<any> = async () => '') => {
    return new Promise<any>((resolve, _) => {
      lock = true;
      func()
        .then((res: any) => {
          currentStep += 1;
          resolve(res);
        })
        .catch(console.error)
        .finally(() => (lock = false));
    });
  };

  const sendChallenge = async (): Promise<any> => {
    try {
      let ref = MAIL_SERVER_URL + '/sendEmail';
      let res = await fetch(ref, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify({ email, address: $userData.account.address }), // body data type must match "Content-Type" header
      });
      if (res.ok) {
        alert.set({
          message: 'Email sent successfully!',
          variant: 'success',
        });

        return next();
      }
      throw new Error(await res.text());
    } catch (e) {
      alert.set({
        message: e.message || JSON.stringify(e),
        variant: 'error',
      });

      throw e;
    }
  };

  const verifyChallenge = async (): Promise<string> => {
    try {
      let ref = MAIL_SERVER_URL + '/verifyChallenge';
      let res = await fetch(ref, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
        body: JSON.stringify({
          challenge,
          email,
          address: $userData.account.address,
        }), // body data type must match "Content-Type" header
      });
      if (res.ok) {
        alert.set({
          message: 'Challenge verified successfully!',
          variant: 'success',
        });
        const resVC = await signEmail(
          $userData,
          email,
          emailMessage?.split('sig:')[1]
        );

        return resVC;
      }
      throw new Error('Challenge wrong!');
    } catch (e) {
      alert.set({
        message: e.message || JSON.stringify(e),
        variant: 'error',
      });

      throw e;
    }
  };
</script>

<!-- TODO: Verify Email Structure -->
<BasePage
  class="flex flex-1 flex-wrap items-center justify-center text-white 2xl:px-32 sm:px-8 px-4 overflow-hidden-x fade-in overflow-y-auto pt-18 sm:pt-22 md:pt-34"
>
  <div class="flex flex-col justify-evenly w-full md:max-w-144">
    <VerificationDescription {display} />

    <VerificationStep
      step={1}
      bind:currentStep
      title="Enter Email Address"
      description="Enter your Email address to verify and include in a message signed by your wallet."
    >
      <div class="flex w-full mt-4 flex-wrap">
        <Input
          bind:value={email}
          name="email"
          placeholder="Enter your Email Address"
          disabled={currentStep !== 1}
          type="email"
        />
        {#if currentStep === 1}
          <PrimaryButton
            text="Submit"
            onClick={() => {
              next(async () => {
                try {
                  emailClaim = await getPreparedUnsignedAttestation({
                    type: 'email',
                    id: email,
                    key: $userData.account.address,
                  });
                } catch (err) {
                  alert.set({
                    variant: 'error',
                    message: `Failed to create Email claim: ${
                      err?.message || JSON.stringify(err)
                    }`,
                  });
                }
              });
            }}
            class="mt-4"
            disabled={email.length < 1}
            small
          />
        {/if}
      </div>
    </VerificationStep>
    <VerificationStep
      step={2}
      bind:currentStep
      title="Signature Prompt"
      description="Sign the message presented to you containing your Email address."
    >
      {#if currentStep >= 2}
        <CopyTextArea bind:value={emailClaim} />
      {/if}
      {#if currentStep === 2}
        <PrimaryButton
          text="Signature Prompt"
          class="mt-4 w-full max-w-48 flex items-center justify-center"
          onClick={() => {
            next(async () => {
              emailMessage = await getFullAttestation(
                {
                  type: 'email',
                  id: email,
                  key: $userData.account.address,
                },
                $userData,
                $wallet
              );
            });
          }}
          disabled={lock}
        />
      {/if}
    </VerificationStep>
    <VerificationStep
      step={3}
      bind:currentStep
      title="Get Challenge"
      description="Click Proceed to receive an email containing a challenge."
    >
      {#if currentStep === 3}
        <div class="flex flex-col lg:flex-row">
          <PrimaryButton
            text="Proceed"
            class="mt-4 sm:mt-8 w-full max-w-48 flex items-center justify-center"
            onClick={() => sendChallenge()}
          />
        </div>
      {/if}
    </VerificationStep>
    <VerificationStep
      step={4}
      bind:currentStep
      title="Verify Email"
      description="Paste here the challenge in order to verify your email."
    >
      {#if currentStep === 4}
        <Input
          placeholder="Enter the challenge"
          class="my-4 sm:my-6"
          bind:value={challenge}
          name="enter-gist-url"
        />
        <PrimaryButton
          text="Verify"
          class="w-full max-w-48 flex items-center justify-center"
          onClick={() => {
            next(verifyChallenge).then((vc) => {
              let nextClaimMap = readClaimMap;
              nextClaimMap.email.preparedContent = JSON.parse(vc);
              nextClaimMap.email.draft = contentToDraft(
                'email',
                nextClaimMap.email.preparedContent
              );
              claimsStream.set(nextClaimMap);
              next();
            });
          }}
          disabled={lock || challenge?.length < 1}
        />
      {:else if currentStep > 4}
        <div class="flex items-center w-full py-2">
          <input
            class="w-full p-2 mr-4 overflow-x-auto rounded-lg resize-none bg-gray-650"
            bind:value={challenge}
            readonly
            disabled
          />
          <CopyButton text={challenge} />
        </div>
      {/if}
    </VerificationStep>

    {#if currentStep > 4}
      <div
        class="flex flex-col mb-4 transition-all ease-in-out duration-500 bg-white p-4 sm:p-10 rounded-lg dropshadow-default"
      >
        <PrimaryButton
          text="Return to Profile"
          onClick={() => navigate('/connect')}
        />
      </div>
    {/if}
  </div>
</BasePage>

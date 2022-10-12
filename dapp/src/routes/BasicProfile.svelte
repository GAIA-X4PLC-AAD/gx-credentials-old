<script lang="ts">
  import {
    BasePage,
    VerificationStep,
    Input,
    Label,
    PrimaryButton,
    ExplainerToolModal,
    Tooltip,
    InfoIcon,
    VerificationDescription,
  } from 'components';
  import { claimsStream, userData, wallet, networkStr } from 'src/store';
  import type { ClaimMap } from 'src/helpers';
  import { contentToDraft } from 'src/helpers';
  import { generateSignature, signBasicProfile } from 'src/basic_profile';
  import { valueDecoder } from '@taquito/local-forging/dist/lib/michelson/codec';
  import { Uint8ArrayConsumer } from '@taquito/local-forging/dist/lib/uint8array-consumer';

  import { useNavigate } from 'svelte-navigator';
  let navigate = useNavigate();

  const verification: ClaimMap = $claimsStream;
  $: display = verification?.basic.display;

  let alias = '';
  let description = '';
  let logo = '';
  let website = '';

  let lock: boolean = false;
  let currentStep: number = 1;
  let toggle;
  let signature = '';

  const next = () => (currentStep = currentStep + 1);
</script>

<BasePage
  class="flex flex-grow text-white 2xl:px-32 px-4 sm:px-8 overflow-visible flex-wrap items-center justify-center pt-18 sm:pt-22 md:pt-34"
>
  <div class="flex flex-col justify-evenly w-full md:max-w-144">
    <VerificationDescription {display} />

    <VerificationStep
      step={1}
      bind:currentStep
      title="Fill in Company Information"
      description="Issue a company self description that will be validated by asc(s. Upon succesuful validation, a verifiable credential will be issued."
    >
      <Label fieldName="name" value="Name" class="mt-6" />
      <Input
        bind:value={alias}
        name="alias"
        placeholder="Enter company name"
        disabled={currentStep !== 1}
      />

      <Label fieldName="description" value="GX-ID" class="mt-2" />
      <Input
        bind:value={description}
        name="description"
        placeholder="Enter GX-ID"
        disabled={currentStep !== 1}
      />

      <Label fieldName="website" value="Country" class="mt-2" />
      <Input
        bind:value={website}
        name="website"
        placeholder="Enter company country"
        disabled={currentStep !== 1}
      />

      <Label fieldName="logo" value="Address" class="mt-2" />
      <Input
        bind:value={logo}
        name="address"
        placeholder="Enter company address"
        disabled={currentStep !== 1}
      />

      {#if currentStep == 1}
        <PrimaryButton
          text="Submit"
          class="mt-8 lg:w-60"
          onClick={() => {
            next();
          }}
          disabled={alias.length < 1 ||
            description.length < 1 ||
            logo.length < 1}
        />
      {/if}

      {#if currentStep == 2}
        <ExplainerToolModal
          bind:toggle
          signature={async () => {
            let profile = {
              alias,
              description,
              website,
              logo,
            };

            return generateSignature(profile, $userData).then(
              ({ micheline }) => {
                let str = JSON.stringify(
                  valueDecoder(
                    Uint8ArrayConsumer.fromHexString(micheline.slice(2))
                  ).string
                );
                str = str.substring(1, str.length - 1);
                return str;
              }
            );
          }}
        />
        <div class="flex items-center flex-grow">
          <PrimaryButton
            text="Review and sign"
            class="mt-8 lg:w-60"
            onClick={() => {
              lock = true;
              let profile = {
                alias,
                description,
                website,
                logo,
              };
              signBasicProfile($userData, $wallet, profile)
                .then((vc) => {
                  let nextClaimMap = verification;
                  nextClaimMap.basic.preparedContent = JSON.parse(vc);
                  nextClaimMap.basic.draft = contentToDraft(
                    'basic',
                    nextClaimMap.basic.preparedContent
                  );
                  claimsStream.set(nextClaimMap);
                  navigate('/connect');
                })
                .catch(console.error)
                .finally(() => (lock = false));
            }}
            disabled={lock}
          />
          <Tooltip
            tooltip="What am I signing?"
            backgroundColor="bg-gray-370"
            textColor="text-white"
            class="mt-1 -ml-1"
          >
            <p
              class="text-gray-370 italic cursor-pointer w-4 h-4 ml-2 mt-2"
              on:click={toggle}
            >
              <InfoIcon />
            </p>
          </Tooltip>
        </div>
      {/if}
    </VerificationStep>
  </div>
</BasePage>

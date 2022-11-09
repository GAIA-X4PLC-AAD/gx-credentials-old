<script lang="ts">
  import { userData, wallet } from 'src/store';
  import { generateSignature } from '../basic_profile';
  import { SigningType } from '@airgap/beacon-sdk';
  import { alert } from 'src/store';
  import { completeIssueCredential, verifyCredential } from 'didkit-wasm';
  import { BasePage, PrimaryButton } from 'components';
  import { fade, slide } from 'svelte/transition';
  import { addDoc, collection } from 'firebase/firestore/lite';
  import { db } from 'src/Firebase';

  let files: any;
  let jsonData: any = null;
  let credentialVerification = 0;

  const submitVC = async () => {
    event.preventDefault();
    try {
      const fileData = await files[0].text();
      if (fileData.length > 0) jsonData = JSON.parse(fileData);
    } catch (error) {
      throw new Error(error);
    }
  };

  $: jsonData && runVerification();
  $: fileName = files ? files[0].name : null;

  const runVerification = async () => {
    credentialVerification = 0;
    const { micheline, credentialString, prepStr } = await generateSignature(
      {
        alias: jsonData.credentialSubject?.alias,
        description: jsonData.credentialSubject?.description,
        website: jsonData.credentialSubject?.website,
        logo: jsonData.credentialSubject?.logo,
      },
      $userData
    );

    const payload = {
      signingType: SigningType.MICHELINE,
      payload: micheline,
      sourceAddress: $userData.account.address,
    };
    const { signature } = await $wallet.client.requestSignPayload(payload);

    let vcStr = await completeIssueCredential(
      credentialString,
      prepStr,
      signature
    );

    const verifyOptionsString = '{}';
    const verifyResult = JSON.parse(
      await verifyCredential(vcStr, verifyOptionsString)
    );
    if (verifyResult.errors.length > 0) {
      credentialVerification = -1;
      const errorMessage = `Unable to verify credential: ${verifyResult.errors.join(
        ', '
      )}`;
      alert.set({
        message: errorMessage,
        variant: 'error',
      });
      throw new Error(errorMessage);
    } else {
      credentialVerification = 1;
      alert.set({
        message: 'Credentials have been verified successfully!',
        variant: 'success',
      });
      await addRequestToDb(jsonData);
    }
  };

  const addRequestToDb = async (jsonData) => {
    try {
      const docRef = await addDoc(collection(db, 'Requests'), {
        DID: jsonData.credentialSubject.id,
        description: jsonData.credentialSubject.description,
        website: jsonData.credentialSubject.website,
        alias: jsonData.credentialSubject.alias,
        logo: jsonData.credentialSubject.logo,
        status: 'Pending',
      });
      console.log('Document written with ID: ', docRef.id);
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };
</script>

<BasePage
  class="flex flex-grow text-white 2xl:px-32 px-4 sm:px-8 overflow-visible flex-wrap  justify-center align pt-18 sm:pt-22 md:pt-34"
>
  <div class="flex-wrap justify-center rounded-lg w-1/3">
    <label
      for="dropzone-file"
      in:fade
      class="flex flex-col justify-center items-center w-full h-30 bg-gray-50 rounded-lg cursor-pointer dark:hover:bg-bray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600 break-all  shadow-lg"
    >
      <div class="flex flex-col justify-center items-center pt-5 pb-6">
        <svg
          aria-hidden="true"
          class="mb-3 w-10 h-10 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          ><path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          /></svg
        >
        {#if !fileName}
          <p
            out:slide
            class="mb-2 text-sm text-gray-500 dark:text-gray-400 p-1"
          >
            <span class="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p out:slide class="text-xs text-gray-500 dark:text-gray-400 p-1">
            VC in JSON format
          </p>
        {:else}
          <div in:fade class="text-gray-500 dark:text-gray-400 pt-5 px-2">
            {fileName}
          </div>
        {/if}
      </div>
      <input id="dropzone-file" type="file" class="hidden" bind:files />
    </label>
    <p>Info is displayed here</p>
    {#if files}
      <div in:fade class="flex justify-center">
        <PrimaryButton class="m-2" text="Submit" onClick={submitVC} />
      </div>
    {/if}
  </div>
</BasePage>

<style></style>

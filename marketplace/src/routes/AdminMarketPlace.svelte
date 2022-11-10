<script lang="ts">
  import { BasePage } from 'components';
  import { onMount } from 'svelte';
  import {
    collection,
    getDocs,
    getDoc,
    doc,
    updateDoc,
  } from 'firebase/firestore/lite';
  import { db } from 'src/Firebase';
  import { fade, scale } from 'svelte/transition';
  import { flip } from 'svelte/animate';

  let loading = false;
  let requestData = null;
  onMount(async () => {
    loading = true;
    const requestsCol = collection(db, 'Requests');
    const requestSnapshot = await getDocs(requestsCol);
    requestData = requestSnapshot.docs.map((doc) => doc.data());
    loading = false;
  });
  $: console.log('AA: ', requestData);
  const labelClass =
    'px-4 py-2 rounded-full font-semibold text-sm  bg-green-200 ';

  const updateStatus = async (event, info) => {
    const docRef = doc(db, 'Requests', info.DID.split(/[: ]+/).pop());
    if (docRef) {
      if (event.target.id === 'accept') {
        await updateDoc(docRef, { status: 'Approved' });
      }
      if (event.target.id === 'reject') {
        await updateDoc(docRef, { status: 'Rejected' });
      }
      console.log('infoDID: ', info.DID);
      const updatedData = requestData.filter(
        (element) => element.DID !== info.DID
      );
      requestData = updatedData;
    }
  };
  $: console.log('requestData: ', requestData);
</script>

<BasePage class="main flex place-items-center h-screen">
  <!-- <div class="flex place-items-center h-screen sm:flex-col"> -->
  {#each requestData || [] as info, i (info)}
    <div
      animate:flip={{ duration: 300 }}
      out:scale={{ duration: 250 }}
      in:scale={{ duration: 250 }}
      class="card bg-white m-3 flex flex-col justify-center p-4 shadow-lg rounded-2xl w-2/5 break-all h-65 hover:bg-slate-100"
    >
      <div class="flex flex-col">
        <div class="grid grid-cols-3">
          <div class="content-center my-3">
            <label for="did" class={labelClass}>DID</label>
          </div>
          <div id="did" class="p-1 justify-start content-center col-span-2">
            {info.DID}
          </div>
        </div>
        <div class="grid grid-cols-3">
          <div for="description" class="content-center my-3">
            <label for="description" class={labelClass}>Description</label>
          </div>
          <div
            id="description"
            class="p-1 justify-start content-center col-span-2"
          >
            {info.description}
          </div>
        </div>
        <div class="grid grid-cols-3">
          <div for="description" class="content-center my-3">
            <label for="alias" class={labelClass}>Alias</label>
          </div>
          <div id="alias" class="p-1 justify-start content-center col-span-2">
            {info.alias}
          </div>
        </div>
        <div class="flex flex-3 p-1 justify-start content-center">
          <div class="flex justify-center mt-4">
            <button
              id="accept"
              type="button"
              class="text-white bg-green-700 hover:bg-green-800 focus:outline-none font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800"
              on:click={(event) => updateStatus(event, info)}>Approve</button
            >
            <button
              id="reject"
              type="button"
              class="text-white bg-red-700 hover:bg-red-800 focus:outline-none font-medium rounded-full text-sm px-5 py-2.5 text-center mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
              on:click={(event) => updateStatus(event, info)}>Reject</button
            >
          </div>
        </div>
      </div>
    </div>
  {/each}
  <!-- </div> -->
</BasePage>

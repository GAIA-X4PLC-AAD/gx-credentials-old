<script lang="ts">
  import { Card, PrimaryButton, LoadingSpinner } from 'components';
  import { BasePage } from 'components';
  import { onMount } from 'svelte';
  import { collection, getDocs } from 'firebase/firestore/lite';
  import { db } from 'src/Firebase';

  let loading = false;
  let requestData = null;
  onMount(async () => {
    loading = true;
    const requestsCol = collection(db, 'Requests');
    const requestSnapshot = await getDocs(requestsCol);
    requestData = requestSnapshot.docs.map((doc) => doc.data());
    loading = false;
  });
</script>

<BasePage class="main grid place-items-center h-screen">
  <div
    class="card bg-white flex flex-col items-center justify-center p-4 shadow-lg rounded-2xl w-64"
  >
    This is admin dashboard
  </div>
  <div
    class="card bg-white flex flex-col items-center justify-center p-4 shadow-lg rounded-2xl w-64"
  >
    This is another admin dashboard
  </div>
</BasePage>
<!-- <span
  class="inline-block px-2 py-1 leading-none bg-orange-200 text-orange-800 rounded-full font-semibold uppercase tracking-wide text-xs"
  >Highlight</span
> -->

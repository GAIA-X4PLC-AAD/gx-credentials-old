<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { claimsStream, networkStr, userLog } from 'src/store';
  import './availablecredentials.scss';
  import 'src/common/style/animation.scss';
  import * as helpers from '../../../helpers/index';
  import { collection, getDocs } from 'firebase/firestore/lite';
  import { db } from 'src/Firebase';
  import { element } from 'svelte/internal';
  import { useNavigate } from 'svelte-navigator';
  import { LoadingSpinner } from 'components/icons';

  let navigate = useNavigate();

  let currentNetwork: string;
  networkStr.subscribe((x) => {
    currentNetwork = x;
  });

  let log: helpers.Log;

  userLog.subscribe((x) => {
    log = x;
  });

  let loading = false;
  let listDIDs = null;
  onMount(async () => {
    loading = true;
    const adminCol = collection(db, 'Admins');
    const DIDSnapshot = await getDocs(adminCol);
    listDIDs = DIDSnapshot.docs.map((doc) => doc.data());
    loading = false;
  });
</script>

<div class="table-container fade-in mb-4 p-4">
  <div class="header-row-container">
    {#if loading}
      <LoadingSpinner />
    {:else}
      <div class="body flex flex-row items-center w-full justify-between">
        {#if listDIDs}
          {#if listDIDs.filter((element) => element.DID === log?.did && element.Active).length === 0}
            {navigate('/uploadCredentials')};
          {:else}
            {navigate('/adminMarketPlace')};
          {/if}
        {/if}
      </div>
    {/if}
  </div>
</div>

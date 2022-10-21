<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { claimsStream, networkStr, userLog } from 'src/store';
  import './availablecredentials.scss';
  import { canUpload } from './uploadHelpers';
  import 'src/common/style/animation.scss';
  import * as helpers from '../../../helpers/index';

  let currentNetwork: string;
  networkStr.subscribe((x) => {
    currentNetwork = x;
  });

  let log: helpers.Log;

  userLog.subscribe((x) => {
    log = x;
  });

  onMount(() => {
    if (canUpload($claimsStream)) {
      window.addEventListener('beforeunload', (e) => {
        e.preventDefault();
        return (e.returnValue = '');
      });
    }
  });

  onDestroy(() => {
    window.removeEventListener('beforeunload', () => {});
  });
</script>

<div class="table-container fade-in mb-4 p-4">
  <div class="header-row-container">
    <div class="body flex flex-row items-center w-full justify-between">
      {#if log?.message === 'Credentials have been published to the blockchain'}
        <div class="text-xl sm:text-2xl font-bold body">Welcome to ENVITED</div>
      {:else}
        <div class="text-xl sm:text-2xl font-bold body">No Access!</div>
      {/if}
    </div>
  </div>
</div>

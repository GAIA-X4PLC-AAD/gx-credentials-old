<script lang="ts">
  import type { EmailDraft, Claim } from 'src/helpers';
  import { Input, Label } from 'src/components';
  import { ClaimLinkInput } from 'src/components/claims';

  export let claim: Claim;
  $: display = claim.display;
  $: draft = claim.draft as EmailDraft;
</script>

<div>
  <div class="flex justify-between items-center">
    <Label class="mt-4" fieldName="basic-email" value="Email Address" />

    {#if draft?.email}
      <p class="text-sm text-gray-350 mt-2">(signed-by ascs)</p>
    {/if}
  </div>
  {#if draft?.email}
    <div class="flex items-center">
      <Input
        fluid
        class="font-bold"
        name="emails"
        value={draft?.email}
        disabled
      />
    </div>
  {:else}
    <ClaimLinkInput {display} />
  {/if}
</div>

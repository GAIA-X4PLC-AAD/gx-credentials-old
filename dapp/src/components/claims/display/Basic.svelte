<script lang="ts">
  import { Input, Label } from 'src/components';
  import { ClaimLinkInput } from 'src/components/claims';
  import type { BasicDraft, Claim } from 'src/helpers';

  export let basicClaim: Claim;
  $: display = basicClaim.display;
  $: draft = basicClaim.draft as BasicDraft;
</script>

<div>
  <div class="flex justify-between items-center">
    <Label class="mt-4" fieldName="basic-alias" value="Name" />
    {#if draft.alias}
      <p class="text-sm text-gray-350 mt-2">({'asc(s-attested'})</p>
    {/if}
  </div>
  {#if draft.alias}
    <Input fluid name="basic-alias" class="mb-3" value={draft.alias} disabled />
  {:else}
    <ClaimLinkInput {display} />
  {/if}

  <div class="flex justify-between items-center">
    <Label class="mt-4" fieldName="basic-description" value="GX-ID" />
    {#if draft.description}
      <p class="text-sm text-gray-350 mt-2">({'asc(s-attested'})</p>
    {/if}
  </div>
  {#if draft.description}
    <Input
      fluid
      name="basic-description"
      class="mb-3"
      value={draft.description}
      disabled
    />
  {:else}
    <ClaimLinkInput {display} />
  {/if}

  <div class="flex justify-between items-center">
    <Label class="mt-4" fieldName="basic-website" value="Country" />
    {#if draft.website}
      <p class="text-sm text-gray-350 mt-2">({'asc(s-attested'})</p>
    {/if}
  </div>
  {#if draft.website}
    <Input
      fluid
      name="basic-website"
      class="mb-3"
      value={draft.website}
      disabled
    />
  {:else}
    <ClaimLinkInput {display} />
  {/if}

  <div class="flex justify-between items-center">
    <Label class="mt-4" fieldName="basic-logo" value="Address" />
    {#if draft.logo}
      <p class="text-sm text-gray-350 mt-2">({'asc(s-attested'})</p>
    {/if}
  </div>
  {#if draft.logo}
    <Input fluid name="basic-logo" class="mb-3" value={draft.logo} disabled />
  {:else}
    <ClaimLinkInput {display} />
  {/if}
</div>

<template>
  <t-space align="center" size="large">
    <t-badge dot>
      <div class="badge-block" />
    </t-badge>
    <t-badge dot> 解锁新徽章 </t-badge>
    <t-badge dot>
      <user-icon size="24" />
    </t-badge>
  </t-space>
</template>

<script setup lang="jsx">
import { UserIcon } from 'tdesign-icons-vue-next';
</script>

<style>
.badge-block {
  width: 40px;
  height: 40px;
  background: #eeeeee;
  border: 1px solid #dcdcdc;
  box-sizing: border-box;
  border-radius: 3px;
}
</style>

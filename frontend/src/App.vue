<template>
  <router-view />
  <RewardToastHost />
  <MobileFooterNav />
</template>

<script setup>
import MobileFooterNav from './components/MobileFooterNav.vue';
import RewardToastHost from './components/ui/RewardToastHost.vue';
</script>

<template>
  <div class="">
    <div class="years" v-for="(year, index) in data" :key="index + year">
      <div class="year">
        {{ year[0].frontMatter.date.split("-")[0] + '-' + year[0].frontMatter.date.split("-")[1] }}
      </div>
      <a
        v-show="!article.frontMatter.home"
        v-for="(article, el) in year"
        :href="base + article.regularPath || ''"
        :key="el"
        target="_blank"
        class="article"
      >
        <div class="title">
          • {{ article.frontMatter.title || "" }}
        </div>
        <div class="date">{{ article.frontMatter.date.slice(5) || "" }}</div>
      </a>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from "vue";
import { withBase, useYearSort } from "../../theme-default/utils";
import { usePageData, useSiteData } from "vitepress";
import { base } from "../../build";

export default defineComponent({
  setup() {
    const siteData = useSiteData();

    const data = computed(() => useYearSort(siteData.value.themeConfig.pages));
    console.log(data)

    return {
      data,
      base,
    };
  },
});
</script>

<style scoped>
.header {
  color: #353535;
  font-size: 2rem;
  font-weight: 600;
  margin: 1rem 0;
  text-align: center;
}
.year {
  padding: 15px 0;
  font-size: 1.2rem;
  border-bottom: 1px solid #ccc;
  font-weight: 600;
  color: var(--text-color);
}
.article {
  padding: 2px;
  margin: 6px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-style: italic;
}
.title {
  color: var(--accent-color);
  font-size: 0.9rem;
}
.date {
  color: #ccc;
  font-size: 0.9rem;
}

@media screen and (max-width: 700px) {
  .header {
    font-size: 1.5rem;
  }
  .article {
    padding: 2px;
  }
  .date,
  .title {
    font-size: 0.9rem;
  }
  .title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 14em;
  }
}
</style>
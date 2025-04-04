<template>
  <div class="header">{{ selectTag }}</div>
  <a
    v-show="!article.frontMatter.home"
    v-for="(article, el) in data[selectTag]"
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

  <div class="tags">
    <span
      @click="toggleTag(key)"
      v-for="(item, key, index) in data"
      class="tag"
      :key="index + key"
    >
      {{ key }}
    </span>
  </div>
</template>

<script>
import { defineComponent, computed, watch, ref } from "vue";
import { withBase, initTags } from "../../theme-default/utils";
import { base } from "../../build";

import {
  usePageData,
  useSiteData,
  useRoute,
  useSiteDataByRoute,
} from "vitepress";

export default defineComponent({
  setup() {
    const siteData = useSiteData();
    const route = useRoute();
    const data = computed(() => initTags(siteData.value.themeConfig.pages));
    let selectTag = ref("");
    const toggleTag = (tag) => {
      selectTag.value = tag;
    };
    return {
      data,
      route,
      toggleTag,
      selectTag,
      base,
    };
  },
});
</script>

<style scoped>
.header {
  color: var(--text-color);
  font-size: 2rem;
  font-weight: 600;
  margin: 1rem 0;
  text-align: center;
}
.tags {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}
.tag {
  display: inline-block;
  position: relative;
  padding: 2px 20px 4px;
  padding-right: 10px;
  margin: 0 16px 12px 0;
  font-size: 14px;
  line-height: 25px;
  background-color: #5bc0de;
  transition: 0.4s;
  color: #000;
  cursor: pointer;
  border-radius: 33px 0 0 33px;
}
.tag:hover {
  background-color: #5cb75d;
}
.tag::before {
  content: "";
  position: absolute;
  width: 5px;
  margin-top: 11px;
  margin-left: -10px;
  height: 5px;
  background: #fff;
  border-radius: 50%;
}
.year {
  padding: 15px 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-color);
}
.article {
  padding: 2px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  text-decoration: none;
  font-style: italic;
  margin: 6px 0;
}

.article:hover .date {
  color: #000;
}
.article:hover .title {
  color: #2b90c1;
}
.article:hover {
  text-decoration: none;
}
.title {
  color: #4a9ae1;
  font-size: .9rem;
}
.date {
  color: #ccc;
  font-size: .9rem;
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
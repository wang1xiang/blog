<template>
  <div>
    <div class="article-search">
      <input class="article-search__input" type="search" placeholder="搜索文章" @blur="handleSearch" @search="handleSearch" />
      <img src="//lf3-cdn-tos.bytescm.com/obj/static/xitu_juejin_web/1e8ab9a22f0ddc36349f60b38900d0bd.svg" alt="搜索" class="search-icon">
    </div>
    <a
      v-show="!article.frontMatter.home"
      v-for="(article, index) in dynamicPage.currentData"
      :key="index"
      :href="base + article.regularPath || ''"
      class="article"
    >
      <div class="article-header">
        <div class="title">
          {{ article.frontMatter.title || "" }}
          <div class="line"></div>
        </div>
        <time :datetime="article.frontMatter.date" class="time">
          {{ article.frontMatter.date || "" }}
        </time>
      </div>

      <p class="describe">
        {{ article.frontMatter.describe || "" }}
      </p>
    </a>
    <div class="paging">
      <div
        class="prev"
        v-if="initPage.page !== 0"
        @click="getChangePage(-1)"
      ></div>
      <span>{{ dynamicPage.totalPages }} - {{ initPage.page + 1 }}</span>
      <div
        class="next"
        v-if="initPage.page + 1 !== dynamicPage.totalPages"
        @click="getChangePage(1)"
      ></div>
    </div>
    <PageEdit />
  </div>
</template>

<script>
import { defineComponent, computed, reactive, ref, watch } from 'vue';
import NavBarLink from "./NavBarLink.vue";
import { withBase, parseMarkdownList } from "../utils";
import { usePageData, useSiteData } from "vitepress";
import { base } from "../../build";
import PageEdit from "./PageEdit.vue";

export default defineComponent({
  components: {
    NavBarLink,
    PageEdit,
  },
  setup() {
    const pageData = usePageData();
    const siteData = useSiteData();
    const data = computed(() => pageData.value.frontmatter);
    const actionLink = computed(() => ({
      link: data.value.actionLink,
      text: data.value.actionText,
    }));

    const heroImageSrc = computed(() => withBase(data.value.heroImage));
    const siteTitle = computed(() => siteData.value.title);
    const siteDescription = computed(() => siteData.value.description);

    // 文章总数据
    let totalData = computed(() =>
      parseMarkdownList(siteData.value.themeConfig.pages)
    );

    // 初始化页码信息
    const initPage = reactive({
      page: 0,
      pageSize: 5,
    });

    // 格式化数据
    const formattedData = (value = '') => {
      const data = totalData.value.filter(item => item.frontMatter?.title?.toLocaleLowerCase()?.includes(value.toLocaleLowerCase()) || item.frontMatter?.describe?.toLocaleLowerCase()?.includes(value.toLocaleLowerCase()))
      var incisionArray = new Array(
        Math.ceil(data.length / initPage.pageSize)
      );
      for (let i = 0; i < incisionArray.length; i++) {
        incisionArray[i] = new Array();
      }
      for (let i = 0; i < data.length; i++) {
        incisionArray[parseInt(i / initPage.pageSize)][i % initPage.pageSize] =
          data[i];
      }
      // 返回切割后的二维数组
      return incisionArray;
    };
    // 获取到所有数据
    const ALLDATA = ref(formattedData());

    // 动态切换的分页
    const dynamicPage = reactive({
      currentData: ALLDATA.value[initPage.page],
      totalPages: ALLDATA.value.length,
    });

    // 执行分页
    const getChangePage = (page) => {
      if (initPage.page + 1 !== dynamicPage.totalPages || initPage.page !== 0) {
        initPage.page += page;
        dynamicPage.currentData = ALLDATA.value[initPage.page];
      }
    };

    const handleSearch = e => {
      ALLDATA.value = formattedData(e.target.value)
      dynamicPage.currentData = ALLDATA.value[initPage.page];
      dynamicPage.totalPages = ALLDATA.value.length;
    };
    
    return {
      data,
      handleSearch,
      actionLink,
      heroImageSrc,
      dynamicPage,
      base,
      getChangePage,
      siteTitle,
      initPage,
      siteDescription,
    };
  },
});
</script>

<style scoped>
.article-search {
  position: fixed;
  top: 10px;
  right: 338px;
  width: 260px;
  height: 40px;
  display: flex;
  align-items: center;
  border-radius: 4px;
  border: 1px solid #c2c8d1;
  transition: width .2s;
  z-index: 999;
}
.article-search__input {
  border: none;
  width: calc(100% - 34px);
  padding: 0.6rem 0 0.6rem 1rem;
  box-shadow: none;
  outline: none;
  font-size: 1rem;
  color: #8a919f;
  background-color: transparent;
  transition: width .3s;
}
.search-icon {
  cursor: pointer;
}
input[type=search]::-webkit-search-cancel-button {
-webkit-appearance: none;
}
.prev {
  background-image: url("./icons/prev.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  cursor: pointer;
}
.next {
  background-image: url("./icons/next.png");
  background-repeat: no-repeat;
  background-size: 100% 100%;
  cursor: pointer;
}
.paging {
  display: flex;
  justify-content: space-between;
  padding: 2rem;
  justify-content: center;
  align-items: center;
}

.paging > span {
  display: block;
  flex: 1;
  font-size: 1.2rem;
  text-align: center;
  color: var(--text-color-light);
}

.paging > div {
  font-weight: 500;
  font-size: 1.5rem;
  width: 32px;
  height: 32px;
}

.paging > div:hover {
  text-decoration: none !important;
}
.article {
  display: block;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-color-light);
  padding: 2rem 0;
}
.article-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.time {
  color: #aaa;
  letter-spacing: 0.5px;
}
.title {
  color: var(--title-color);
  display: block;
  font-size: 1.2rem;
  font-weight: 600;
  margin: 0.5rem 0 0 0;
}
.describe {
  font-size: 14px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}
.line {
  -webkit-transition: all 0.4s ease-out;
  -moz-transition: all 0.4s ease-out;
  transition: all 0.4s ease-out;
  border-top: 0.2rem solid var(--text-color-light);
  display: block;
  width: 2rem;
}
.title:hover .line {
  width: 100%;
}
@media screen and (max-width: 800px) {
  .article-search { 
    display: none;
  }
}
@media screen and (max-width: 700px) {
  .article {
    padding: 1rem 0;
  }
  .title {
    font-size: 1.1rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    width: 14em;
  }
  .describe {
    font-size: 14px;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
    overflow: hidden;
    padding: 0 0.5em;
  }
  .time {
    font-size: 14px;
  }
  .line {
    border-top: 0.15rem solid #353535;
  }
}
</style>

import Search from './models/Search';
import Recipe from './models/Recipe';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import { elements, renderLoader, clearLoader } from './views/base';

// 모든 앱의 상태는 state 변수에서 관리 한다.
/** Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */
const state = {};

/**
 * SEARCH CONTROLLER
 */
const controlSearch = async () => {
  // 1. view에서 쿼리를 가져온다.
  const query = searchView.getInput();

  if (query) {
    // 2. 새로운 search object를 state변수에 더한다.
    state.search = new Search(query);

    // 3. 결과가 나오기 전 준비된 UI를 먼저 보여준다. (ex. 로딩, 스켈레톤)
    searchView.clearInput();
    searchView.clearResults();
    renderLoader(elements.searchRes);
    try {
      // 4. 레시피를 검색한다.
      await state.search.getResults();

      // 5. UI에 렌더링 시킨다.
      clearLoader();
      searchView.renderResults(state.search.result);
    } catch (error) {
      alert('Something wrong with the search...');
      clearLoader();
    }
  }
};

elements.searchForm.addEventListener('submit', e => {
  e.preventDefault();
  controlSearch();
});

elements.searchResPages.addEventListener('click', e => {
  const btn = e.target.closest('.btn-inline');
  if (btn) {
    const goToPage = parseInt(btn.dataset.goto, 10);
    searchView.clearResults();
    searchView.renderResults(state.search.result, goToPage);
  }
});

/**
 * RECIPE CONTROLLER
 */
const controlRecipe = async () => {
  // URL로 부터 아이디를 얻는다.
  const id = window.location.hash.replace('#', '');
  console.log(id);

  if (id) {
    // 1. 변경을 위한 UI를 준비한다. (EX: 로딩)
    recipeView.clearRecipe();
    renderLoader(elements.recipe);

    // 1-1. 선택된 서치 아이템을 하이라이트 시킨다.
    if (state.search) {
      searchView.highlightSelected(id);
    }

    // 2. 새로운 레시피 오브젝트를 생성한다.
    state.recipe = new Recipe(id);

    try {
      // 3. 레시피 데이터를 얻어온다. 그리고 재료들을 파스(parse)시킨다.
      await state.recipe.getRecipe();
      state.recipe.parseIngredients();
      // 4. 쿠킹타임(calcTime)과 몇명에서 먹을 수 있는지(calcServings)를 계산한다.
      state.recipe.calcTime();
      state.recipe.calcServings();
      // 5. 레시피를 그린다.
      clearLoader();
      recipeView.renderRecipe(state.recipe);
    } catch (error) {
      alert('Error processing recipe!');
    }
  }
}

// window.addEventListener('hashchange', controlRecipe);
// 해쉬를 가지고 다시 유저가 접근 했을 때 이벤트를 일어나게 하기 위해서
// window.addEventListener('load', controlRecipe);

// 이름만 다른 두가지 이벤트를 한번에 달기 위해서
['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

// 레시피 버튼 클릭을 핸들링 한다.
elements.recipe.addEventListener('click', e => {
  if (e.target.matches('.btn-decrease, .btn-decrease *')) {
    // 낮추는 버튼 클릭
    if (state.recipe.servings > 1) {
      state.recipe.updateServings('dec');
      recipeView.updateServingsIngredients(state.recipe);
    }
  } else if (e.target.matches('btn-increase, .btn-increase *')) {
    // 올리는 버튼 클릭
    state.recipe.updateServings('inc');
    recipeView.updateServingsIngredients(state.recipe);
  }
  console.log(state.recipe);
});

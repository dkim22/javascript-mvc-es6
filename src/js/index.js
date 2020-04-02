import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';
import { elements, renderLoader, clearLoader } from './views/base';

// 모든 앱의 상태는 state 변수에서 관리 한다.
/** Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */
const state = {};
window.state = state;
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
      recipeView.renderRecipe(state.recipe, state.likes.isLiked(id));
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

/**
 * LIST CONTROLLER
 */
const controlList = () => {
  // 1. 새로운 리스트 인스턴스가 없으면 만들기
  if (!state.list) {
    state.list = new List();
  }

  // 2. 각각의 재료들을 리스트에 담고 UI에 그리기
  state.recipe.ingredients.forEach(el => {
    const item = state.list.addItem(el.count, el.unit, el.ingredient);
    listView.renderItem(item);
  });
};

// 리스트에 대해 삭제와 업데이트 이벤트
elements.shopping.addEventListener('click', e => {
  const id = e.target.closest('.shopping__item').dataset.itemid;

  // 1. 삭제 버튼
  if (e.target.matches('.shopping__delete, .shopping__delete *')) {
    // 1. 상태에서 삭제
    state.list.deleteItem(id);

    // 2. UI에서 삭제
    listView.deleteItem(id);

    // 2. 카운트 업데이트
  } else if (e.target.matches('.shopping__count-value')) {
    const val = parseFloat(e.target.value, 10);
    // 1. 상태에서 삭제
    state.list.updateCount(id, val);

    // 2. 뷰는 바꿀 필요 없어서 그냥 둠.
  }
});

/**
 * LIKE CONTROLLER
 */
const controlLike = () => {
  if (!state.likes) {
    state.likes = new Likes();
  }
  const currentID = state.recipe.id;

  // 유저가 아직 현재 레시피에 대한 좋아요를 가지고 있지 않았을 때
  if (!state.likes.isLiked(currentID)) {
    // 1. 상태에 좋아요를 넣는다.
    const newLike = state.likes.addLike(
      currentID,
      state.recipe.title,
      state.recipe.author,
      state.recipe.img
    );

    // 2. 좋아요 아이콘 버튼에 색을 넣는다 토글 방식
    likesView.toggleLikeBtn(true);

    // 3. 좋아요한 아이템의 리스트를 UI에 더한다.
    likesView.renderLike(newLike);


    // 유저가 현재 레시피에 대한 좋아요를 가지고 있을 때
  } else {
    // 1. 상태에 좋아요를 지운다.
    state.likes.deleteLike(currentID);

    // 2. 좋아요 아이콘 버튼에 색을 뺀다 토글 방식
    likesView.toggleLikeBtn(false);

    // 3. 좋아요한 아이템의 리스트를 UI에서 뺀다.
    likesView.deleteLike(currentID);
  }
  likesView.toggleLikeMenu(state.likes.getNumLikes());
};

// 페이지가 로드될 때 레시피의 좋아요 했던 것을 가져오기
window.addEventListener('load', () => {
  state.likes = new Likes();

  // 1. 좋아요 가져오기
  state.likes.readStorage();

  // 2. 좋아요 한게 있으면 좋아요 모양 보이게
  likesView.toggleLikeMenu(state.likes.getNumLikes());

  // 3. 존재하는 좋아요를 그린다.
  state.likes.likes.forEach(like => likesView.renderLike(like));
});

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
  } else if (e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
    // 리스트 아이템에 대한 처리를 한다.
    controlList();
  } else if (e.target.matches('.recipe__love, .recipe__love *')) {
    // 라이크에 대한 처리를 한다.
    controlLike();
  }
});

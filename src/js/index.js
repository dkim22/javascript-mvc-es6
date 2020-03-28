import Search from './models/Search';
import * as searchView from './views/searchView';
import { elements, renderLoader, clearLoader } from './views/base';
// 모든 앱의 상태는 state 변수에서 관리 한다.
/** Global state of the app
 * - Search object
 * - Current recipe object
 * - Shopping list object
 * - Liked recipes
 */
const state = {};

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
    // 4. 레시피를 검색한다.
    await state.search.getResults();

    // 5. UI에 렌더링 시킨다.
    clearLoader();
    searchView.renderResults(state.search.result);
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
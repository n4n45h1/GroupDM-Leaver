document.addEventListener('DOMContentLoaded', () => {
  const API_ENDPOINT = 'https://discord.com/api/v9';
  const SOURCE_CODE_URL = 'https://github.com/n4n45h1/GroupDM-Leaver';
  const DEFAULT_AVATAR_URL = 'https://cdn.discordapp.com/embed/avatars/0.png';
  const STORAGE_KEYS = {
    token: 'discord_user_token',
    language: 'discord_language',
    theme: 'discord_theme'
  };

  const state = {
    token: null,
    groupDMs: [],
    visibleDMs: [],
    selectedDMIds: new Set(),
    filters: new Set(),
    language: 'ja',
    theme: 'dark',
    isLeaving: false
  };

  const els = {
    tokenContainer: document.getElementById('token-container'),
    tokenInput: document.getElementById('token-input'),
    tokenSubmit: document.getElementById('token-submit'),
    tokenVisibilityToggle: document.getElementById('token-visibility-toggle'),
    userInfo: document.getElementById('user-info'),
    username: document.getElementById('username'),
    userTag: document.getElementById('user-tag'),
    userAvatar: document.getElementById('user-avatar'),
    logoutButton: document.getElementById('logout-button'),
    groupDMContainer: document.getElementById('group-dm-container'),
    refreshButton: document.getElementById('refresh-button'),
    selectAllButton: document.getElementById('select-all-button'),
    deselectAllButton: document.getElementById('deselect-all-button'),
    leaveSelectedButton: document.getElementById('leave-selected-button'),
    dmList: document.getElementById('dm-list'),
    loading: document.getElementById('loading'),
    noGroups: document.getElementById('no-groups'),
    statTotal: document.getElementById('stat-total'),
    statVisible: document.getElementById('stat-visible'),
    statSelected: document.getElementById('stat-selected'),
    resultsContainer: document.getElementById('results-container'),
    resultsList: document.getElementById('results-list'),
    clearResultsButton: document.getElementById('clear-results-button'),
    confirmModal: document.getElementById('confirm-modal'),
    confirmCancel: document.getElementById('confirm-cancel'),
    confirmProceed: document.getElementById('confirm-proceed'),
    currentDateElement: document.getElementById('current-date'),
    currentCodeElement: document.getElementById('current-code'),
    langJaBtn: document.getElementById('lang-ja'),
    langEnBtn: document.getElementById('lang-en'),
    themeDarkBtn: document.getElementById('theme-dark'),
    themeLightBtn: document.getElementById('theme-light'),
    toggleFilterBtn: document.getElementById('toggle-filter'),
    filterContainer: document.getElementById('filter-container'),
    userFilterInput: document.getElementById('user-filter'),
    applyFilterBtn: document.getElementById('apply-filter'),
    filterBadges: document.getElementById('filter-badges'),
    sendMessageToggle: document.getElementById('send-message-toggle'),
    messageContainer: document.getElementById('message-container'),
    leaveMessageInput: document.getElementById('leave-message')
  };

  const langDict = {
    ja: {
      title: 'Discord グループDM 自動退室ツール',
      subtitle: '複数のDiscordグループDMを簡単に一括退室できます',
      'token-title': 'Discord ユーザートークンを入力',
      'token-desc': 'あなたのDiscordユーザートークンを入力して接続してください：',
      'token-placeholder': 'Discordユーザートークンを貼り付けてください',
      'show-token': 'トークンを表示する',
      connect: '接続',
      'disclaimer-1': '⚠️ このツールはブラウザ上でのみ実行されます。あなたのトークンがサーバーに送信されることはありません。',
      'disclaimer-2': '⚠️ 自己責任で使用してください。このツールはDiscordと提携していません。',
      'disclaimer-3': '⚠️ ユーザートークンの使用はDiscordの利用規約に違反する可能性があります。',
      logout: 'ログアウト',
      'your-group-dms': 'あなたのグループDM',
      refresh: '更新',
      'select-all': 'すべて選択',
      'deselect-all': '選択解除',
      'stat-total': '合計',
      'stat-visible': '表示中',
      'stat-selected': '選択中',
      'filter-title': '特定ユーザーによるフィルタリング',
      'toggle-filter': 'フィルターを表示',
      'toggle-filter-hide': 'フィルターを隠す',
      'user-filter-placeholder': 'ユーザー名・ID・グループ名で検索',
      'apply-filter': '適用',
      'loading-dms': 'グループDMを読み込み中...',
      'no-groups': 'グループDMが見つかりませんでした。',
      'leave-message-title': '退室時のメッセージ',
      'send-message-toggle': 'メッセージを送信',
      'leave-message-placeholder': '退室時に送信するメッセージを入力してください',
      'leave-selected': '選択したグループDMを退室',
      results: '結果',
      'clear-results': '結果をクリア',
      'created-by': '作成者: Nanachi',
      'updated-date': '更新日:',
      'source-code': 'ソースコード:',
      'bug-report': 'バグ報告:',
      'confirm-title': '操作の確認',
      'confirm-message': '選択したグループDMから退室してもよろしいですか？この操作は元に戻せません。',
      cancel: 'キャンセル',
      proceed: '続行',
      'success-leave': 'から正常に退室しました',
      'error-leave': 'からの退室に失敗しました',
      'message-sent': '送信メッセージ',
      'summary-success': '成功',
      'summary-failed': '失敗',
      'no-matching-dms': 'フィルター条件に一致するグループDMはありません',
      'members-label': 'メンバー',
      'error-token': '有効なDiscordトークンを入力してください。',
      'error-user-info': 'ユーザー情報の取得に失敗しました。トークンが正しいか確認してください。',
      'error-fetch-dms': 'グループDMの取得に失敗しました。時間を置いて再試行してください。'
    },
    en: {
      title: 'Discord Group DM Auto-Leaver Tool',
      subtitle: 'Easily leave multiple Discord group DMs at once',
      'token-title': 'Enter Discord User Token',
      'token-desc': 'Enter your Discord user token to connect:',
      'token-placeholder': 'Paste your Discord user token here',
      'show-token': 'Show token',
      connect: 'Connect',
      'disclaimer-1': '⚠️ This tool runs only in your browser. Your token is never sent to this project server.',
      'disclaimer-2': '⚠️ Use at your own risk. This tool is not affiliated with Discord.',
      'disclaimer-3': '⚠️ Using user tokens may violate Discord Terms of Service.',
      logout: 'Logout',
      'your-group-dms': 'Your Group DMs',
      refresh: 'Refresh',
      'select-all': 'Select all',
      'deselect-all': 'Deselect all',
      'stat-total': 'Total',
      'stat-visible': 'Visible',
      'stat-selected': 'Selected',
      'filter-title': 'Filter by specific users',
      'toggle-filter': 'Show filter',
      'toggle-filter-hide': 'Hide filter',
      'user-filter-placeholder': 'Search by username, ID, or group name',
      'apply-filter': 'Apply',
      'loading-dms': 'Loading group DMs...',
      'no-groups': 'No group DMs found.',
      'leave-message-title': 'Leave message',
      'send-message-toggle': 'Send message',
      'leave-message-placeholder': 'Enter a message sent before leaving',
      'leave-selected': 'Leave selected group DMs',
      results: 'Results',
      'clear-results': 'Clear results',
      'created-by': 'Created by: Nanachi',
      'updated-date': 'Updated:',
      'source-code': 'Source code:',
      'bug-report': 'Bug report:',
      'confirm-title': 'Confirm action',
      'confirm-message': 'Are you sure you want to leave selected group DMs? This action cannot be undone.',
      cancel: 'Cancel',
      proceed: 'Proceed',
      'success-leave': 'was left successfully',
      'error-leave': 'failed to leave',
      'message-sent': 'Sent message',
      'summary-success': 'Success',
      'summary-failed': 'Failed',
      'no-matching-dms': 'No group DMs match the current filter',
      'members-label': 'members',
      'error-token': 'Please enter a valid Discord token.',
      'error-user-info': 'Failed to get user info. Check your token and try again.',
      'error-fetch-dms': 'Failed to fetch group DMs. Please try again later.'
    }
  };

  function t(key) {
    return langDict[state.language][key] || key;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  function normalizeFilter(value) {
    return value.trim().toLowerCase();
  }

  function extractErrorMessage(payload, fallbackStatus) {
    if (!payload) return `HTTP ${fallbackStatus}`;
    if (typeof payload === 'string') return payload;
    if (typeof payload.message === 'string') return payload.message;
    return `HTTP ${fallbackStatus}`;
  }

  async function apiRequest(path, options = {}, retryCount = 0) {
    const response = await fetch(`${API_ENDPOINT}${path}`, {
      ...options,
      headers: {
        Authorization: state.token,
        ...(options.headers || {})
      }
    });

    if (response.status === 429 && retryCount < 1) {
      const retryPayload = await response.json().catch(() => null);
      const retryAfter = Number(retryPayload?.retry_after) || 1;
      await sleep(Math.ceil(retryAfter * 1000));
      return apiRequest(path, options, retryCount + 1);
    }

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null);
      throw new Error(extractErrorMessage(errorPayload, response.status));
    }

    if (response.status === 204) {
      return null;
    }

    return response.json().catch(() => null);
  }

  function updateFooterMeta() {
    const now = new Date();
    const isoDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    els.currentDateElement.textContent = isoDate;
    els.currentCodeElement.textContent = SOURCE_CODE_URL;
    els.currentCodeElement.href = SOURCE_CODE_URL;
  }

  function updateFilterToggleLabel() {
    const labelEl = els.toggleFilterBtn.querySelector('[data-lang]');
    const isHidden = els.filterContainer.classList.contains('hidden');
    labelEl.textContent = isHidden ? t('toggle-filter') : t('toggle-filter-hide');
  }

  function updateStats() {
    els.statTotal.textContent = String(state.groupDMs.length);
    els.statVisible.textContent = String(state.visibleDMs.length);
    els.statSelected.textContent = String(state.selectedDMIds.size);
  }

  function updateLeaveButtonStatus() {
    const disabled = state.selectedDMIds.size === 0 || state.isLeaving;
    els.leaveSelectedButton.disabled = disabled;
    els.leaveSelectedButton.classList.toggle('disabled', disabled);
  }

  function updateBulkButtonsStatus() {
    const noVisibleItems = state.visibleDMs.length === 0;
    els.selectAllButton.disabled = noVisibleItems || state.isLeaving;
    els.deselectAllButton.disabled = state.selectedDMIds.size === 0 || state.isLeaving;
    els.refreshButton.disabled = state.isLeaving;
  }

  function updateActionStatus() {
    updateStats();
    updateLeaveButtonStatus();
    updateBulkButtonsStatus();
  }

  function setTheme(theme) {
    const nextTheme = theme === 'light' ? 'light' : 'dark';
    state.theme = nextTheme;

    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(`theme-${nextTheme}`);

    els.themeDarkBtn.classList.toggle('active', nextTheme === 'dark');
    els.themeLightBtn.classList.toggle('active', nextTheme === 'light');

    localStorage.setItem(STORAGE_KEYS.theme, nextTheme);
  }

  function setLanguage(lang) {
    state.language = lang === 'en' ? 'en' : 'ja';

    els.langJaBtn.classList.toggle('active', state.language === 'ja');
    els.langEnBtn.classList.toggle('active', state.language === 'en');
    document.documentElement.setAttribute('lang', state.language);

    document.querySelectorAll('[data-lang]').forEach(el => {
      const key = el.getAttribute('data-lang');
      if (langDict[state.language][key]) {
        el.textContent = t(key);
      }
    });

    document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
      const key = el.getAttribute('data-lang-placeholder');
      if (langDict[state.language][key]) {
        el.placeholder = t(key);
      }
    });

    updateFilterToggleLabel();
    localStorage.setItem(STORAGE_KEYS.language, state.language);
    renderDMList();
  }

  function clearResults() {
    els.resultsList.innerHTML = '';
    els.resultsContainer.classList.add('hidden');
  }

  function appendResult(type, message) {
    els.resultsContainer.classList.remove('hidden');

    const item = document.createElement('li');
    item.className = type === 'success' ? 'success' : type === 'summary' ? 'summary' : 'error';

    const icon = document.createElement('i');
    icon.className = type === 'success' ? 'fas fa-check-circle' : type === 'summary' ? 'fas fa-list-check' : 'fas fa-times-circle';

    const text = document.createElement('span');
    text.textContent = message;

    item.append(icon, text);
    els.resultsList.appendChild(item);
  }

  function renderFilterBadges() {
    els.filterBadges.innerHTML = '';

    state.filters.forEach(filter => {
      const badge = document.createElement('div');
      badge.className = 'filter-badge';

      const label = document.createElement('span');
      label.textContent = filter;

      const removeButton = document.createElement('button');
      removeButton.className = 'badge-remove';
      removeButton.type = 'button';
      removeButton.dataset.filter = filter;
      removeButton.setAttribute('aria-label', 'remove filter');
      removeButton.innerHTML = '<i class="fas fa-times"></i>';
      removeButton.addEventListener('click', () => {
        state.filters.delete(filter);
        applyUserFilters();
      });

      badge.append(label, removeButton);
      els.filterBadges.appendChild(badge);
    });
  }

  function getDMDisplayName(dm) {
    return dm.name?.trim() || (state.language === 'ja' ? 'グループDM' : 'Group DM');
  }

  function getDMInitial(dm) {
    const fallback = state.language === 'ja' ? 'G' : 'G';
    const source = dm.name?.trim() || dm.recipients?.[0]?.username || fallback;
    return source.charAt(0).toUpperCase();
  }

  function createDMItem(dm) {
    const item = document.createElement('li');
    item.className = 'dm-item';
    item.dataset.id = dm.id;

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'dm-checkbox';
    checkbox.dataset.id = dm.id;
    checkbox.checked = state.selectedDMIds.has(dm.id);

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        state.selectedDMIds.add(dm.id);
      } else {
        state.selectedDMIds.delete(dm.id);
      }
      updateActionStatus();
    });

    const icon = document.createElement('div');
    icon.className = 'dm-icon';
    icon.textContent = getDMInitial(dm);

    const details = document.createElement('div');
    details.className = 'dm-details';

    const name = document.createElement('div');
    name.className = 'dm-name';
    name.textContent = getDMDisplayName(dm);

    const members = document.createElement('div');
    members.className = 'dm-members';
    const recipientNames = dm.recipients.map(recipient => recipient.username).join(', ');
    members.textContent = `${dm.recipients.length} ${t('members-label')}: ${recipientNames}`;

    details.append(name, members);
    item.append(checkbox, icon, details);

    return item;
  }

  function renderDMList() {
    els.dmList.innerHTML = '';

    if (state.visibleDMs.length === 0) {
      if (state.groupDMs.length === 0) {
        els.noGroups.classList.remove('hidden');
      } else {
        const empty = document.createElement('div');
        empty.className = 'no-matching-filter';
        empty.textContent = t('no-matching-dms');
        els.dmList.appendChild(empty);
      }
      updateActionStatus();
      return;
    }

    els.noGroups.classList.add('hidden');

    state.visibleDMs.forEach(dm => {
      els.dmList.appendChild(createDMItem(dm));
    });

    updateActionStatus();
  }

  function applyUserFilters() {
    if (state.filters.size === 0) {
      state.visibleDMs = [...state.groupDMs];
    } else {
      const activeFilters = Array.from(state.filters);
      state.visibleDMs = state.groupDMs.filter(dm => {
        const dmName = (dm.name || '').toLowerCase();
        const nameMatches = activeFilters.some(filter => dmName.includes(filter));
        if (nameMatches) {
          return true;
        }
        return dm.recipients.some(recipient => {
          const username = recipient.username.toLowerCase();
          const userId = recipient.id.toLowerCase();
          return activeFilters.some(filter => username.includes(filter) || userId.includes(filter));
        });
      });
    }

    renderFilterBadges();
    renderDMList();
  }

  function addFilterFromInput() {
    const normalized = normalizeFilter(els.userFilterInput.value);
    if (!normalized) {
      return;
    }

    state.filters.add(normalized);
    els.userFilterInput.value = '';
    applyUserFilters();
  }

  function toggleFilter() {
    els.filterContainer.classList.toggle('hidden');
    updateFilterToggleLabel();
  }

  function toggleMessageInput() {
    els.messageContainer.classList.toggle('hidden', !els.sendMessageToggle.checked);
  }

  function toggleTokenVisibility() {
    els.tokenInput.type = els.tokenVisibilityToggle.checked ? 'text' : 'password';
  }

  function showErrorMessage(message) {
    appendResult('error', message);
  }

  async function sendMessage(channelId, message) {
    if (!message.trim()) {
      return { success: true, sent: false };
    }

    try {
      await apiRequest(`/channels/${channelId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: message })
      });
      return { success: true, sent: true };
    } catch (error) {
      return { success: false, sent: false, error: error.message };
    }
  }

  async function leaveGroupDM(channelId) {
    const message = els.leaveMessageInput.value;
    const shouldSendMessage = els.sendMessageToggle.checked && message.trim().length > 0;

    let messageResult = { success: true, sent: false };
    if (shouldSendMessage) {
      messageResult = await sendMessage(channelId, message);
    }

    await apiRequest(`/channels/${channelId}`, { method: 'DELETE' });

    return {
      messageResult,
      messagePreview: message.slice(0, 40)
    };
  }

  async function leaveSelectedGroupDMs() {
    if (state.selectedDMIds.size === 0 || state.isLeaving) {
      return;
    }

    state.isLeaving = true;
    updateActionStatus();
    clearResults();

    const targets = Array.from(state.selectedDMIds);
    let successCount = 0;
    let failedCount = 0;

    for (const dmId of targets) {
      const dm = state.groupDMs.find(item => item.id === dmId);
      const dmName = dm ? getDMDisplayName(dm) : dmId;

      try {
        const result = await leaveGroupDM(dmId);
        const successMessage = state.language === 'ja'
          ? `「${dmName}」${t('success-leave')}`
          : `"${dmName}" ${t('success-leave')}`;
        appendResult('success', successMessage);

        if (result.messageResult.sent) {
          const previewSuffix = els.leaveMessageInput.value.length > 40 ? '...' : '';
          appendResult('success', `${t('message-sent')}: ${result.messagePreview}${previewSuffix}`);
        } else if (!result.messageResult.success) {
          appendResult('error', `${dmName}: ${result.messageResult.error}`);
        }

        successCount += 1;
        state.selectedDMIds.delete(dmId);
        state.groupDMs = state.groupDMs.filter(item => item.id !== dmId);
      } catch (error) {
        failedCount += 1;
        const errorText = state.language === 'ja'
          ? `「${dmName}」${t('error-leave')}: ${error.message}`
          : `"${dmName}" ${t('error-leave')}: ${error.message}`;
        appendResult('error', errorText);
      }
    }

    appendResult('summary', `${t('summary-success')}: ${successCount} / ${t('summary-failed')}: ${failedCount}`);

    state.isLeaving = false;
    applyUserFilters();
  }

  function showAuthUI() {
    els.tokenContainer.classList.add('hidden');
    els.userInfo.classList.remove('hidden');
    els.groupDMContainer.classList.remove('hidden');
  }

  function showGuestUI() {
    els.tokenContainer.classList.remove('hidden');
    els.userInfo.classList.add('hidden');
    els.groupDMContainer.classList.add('hidden');
  }

  function resetSessionState() {
    state.groupDMs = [];
    state.visibleDMs = [];
    state.selectedDMIds.clear();
    state.filters.clear();

    els.dmList.innerHTML = '';
    els.filterBadges.innerHTML = '';
    els.userFilterInput.value = '';
    els.sendMessageToggle.checked = false;
    els.leaveMessageInput.value = '';
    toggleMessageInput();
    clearResults();
    updateActionStatus();
  }

  async function fetchUserInfo() {
    const userData = await apiRequest('/users/@me');

    els.username.textContent = userData.username;
    els.userTag.textContent = userData.discriminator ? `#${userData.discriminator}` : '';
    els.userAvatar.src = userData.avatar
      ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`
      : DEFAULT_AVATAR_URL;
  }

  async function fetchGroupDMs() {
    els.loading.classList.remove('hidden');
    els.noGroups.classList.add('hidden');

    try {
      const channels = await apiRequest('/users/@me/channels');
      state.groupDMs = channels.filter(channel => channel.type === 3);

      const validIds = new Set(state.groupDMs.map(dm => dm.id));
      state.selectedDMIds.forEach(id => {
        if (!validIds.has(id)) {
          state.selectedDMIds.delete(id);
        }
      });

      applyUserFilters();
    } catch (error) {
      showErrorMessage(`${t('error-fetch-dms')} (${error.message})`);
      state.groupDMs = [];
      state.visibleDMs = [];
      renderDMList();
    } finally {
      els.loading.classList.add('hidden');
    }
  }

  async function setToken(token, fromStorage = false) {
    state.token = token;
    if (!fromStorage) {
      localStorage.setItem(STORAGE_KEYS.token, token);
    }

    showAuthUI();

    try {
      await fetchUserInfo();
      await fetchGroupDMs();
    } catch (error) {
      showErrorMessage(`${t('error-user-info')} (${error.message})`);
      logout();
    }
  }

  function logout() {
    state.token = null;
    localStorage.removeItem(STORAGE_KEYS.token);
    resetSessionState();
    showGuestUI();
    els.tokenInput.value = '';
    els.tokenVisibilityToggle.checked = false;
    toggleTokenVisibility();
  }

  function checkStoredToken() {
    const storedToken = localStorage.getItem(STORAGE_KEYS.token);
    if (storedToken) {
      setToken(storedToken, true);
    }
  }

  function setupEventListeners() {
    els.tokenSubmit.addEventListener('click', () => {
      const token = els.tokenInput.value.trim();
      if (!token) {
        showErrorMessage(t('error-token'));
        return;
      }
      setToken(token);
    });

    els.tokenInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        els.tokenSubmit.click();
      }
    });

    els.logoutButton.addEventListener('click', logout);
    els.refreshButton.addEventListener('click', fetchGroupDMs);

    els.selectAllButton.addEventListener('click', () => {
      state.visibleDMs.forEach(dm => state.selectedDMIds.add(dm.id));
      renderDMList();
    });

    els.deselectAllButton.addEventListener('click', () => {
      state.selectedDMIds.clear();
      renderDMList();
    });

    els.leaveSelectedButton.addEventListener('click', () => {
      if (state.selectedDMIds.size > 0) {
        els.confirmModal.classList.remove('hidden');
      }
    });

    els.confirmCancel.addEventListener('click', () => {
      els.confirmModal.classList.add('hidden');
    });

    els.confirmProceed.addEventListener('click', async () => {
      els.confirmModal.classList.add('hidden');
      await leaveSelectedGroupDMs();
    });

    els.confirmModal.addEventListener('click', event => {
      if (event.target === els.confirmModal) {
        els.confirmModal.classList.add('hidden');
      }
    });

    els.langJaBtn.addEventListener('click', () => setLanguage('ja'));
    els.langEnBtn.addEventListener('click', () => setLanguage('en'));
    els.themeDarkBtn.addEventListener('click', () => setTheme('dark'));
    els.themeLightBtn.addEventListener('click', () => setTheme('light'));

    els.toggleFilterBtn.addEventListener('click', toggleFilter);
    els.applyFilterBtn.addEventListener('click', addFilterFromInput);
    els.userFilterInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        addFilterFromInput();
      }
    });

    els.sendMessageToggle.addEventListener('change', toggleMessageInput);
    els.tokenVisibilityToggle.addEventListener('change', toggleTokenVisibility);
    els.clearResultsButton.addEventListener('click', clearResults);
  }

  function loadSettings() {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) || 'dark';
    const savedLanguage = localStorage.getItem(STORAGE_KEYS.language) || 'ja';

    setTheme(savedTheme);
    setLanguage(savedLanguage);
    toggleMessageInput();
    toggleTokenVisibility();
    updateFooterMeta();
    updateActionStatus();
  }

  setupEventListeners();
  loadSettings();
  checkStoredToken();
});

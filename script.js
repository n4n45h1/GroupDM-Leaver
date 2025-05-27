document.addEventListener('DOMContentLoaded', function() {
  // 定数と変数
  const API_ENDPOINT = 'https://discord.com/api/v9';
  
  let userToken = null;
  let groupDMs = [];
  let selectedDMs = new Set();
  let userFilters = new Set();
  let currentLanguage = 'ja';
  let currentTheme = 'dark';
  
  // DOM要素
  const tokenInput = document.getElementById('token-input');
  const tokenSubmit = document.getElementById('token-submit');
  const logoutButton = document.getElementById('logout-button');
  const refreshButton = document.getElementById('refresh-button');
  const selectAllButton = document.getElementById('select-all-button');
  const deselectAllButton = document.getElementById('deselect-all-button');
  const leaveSelectedButton = document.getElementById('leave-selected-button');
  const dmList = document.getElementById('dm-list');
  const loading = document.getElementById('loading');
  const noGroups = document.getElementById('no-groups');
  const resultsContainer = document.getElementById('results-container');
  const resultsList = document.getElementById('results-list');
  const confirmModal = document.getElementById('confirm-modal');
  const confirmCancel = document.getElementById('confirm-cancel');
  const confirmProceed = document.getElementById('confirm-proceed');
  const currentDateElement = document.getElementById('current-date');
  const currentCodeElement = document.getElementById('current-code');
  
  // 新しい機能のDOM要素
  const langJaBtn = document.getElementById('lang-ja');
  const langEnBtn = document.getElementById('lang-en');
  const themeDarkBtn = document.getElementById('theme-dark');
  const themeLightBtn = document.getElementById('theme-light');
  const toggleFilterBtn = document.getElementById('toggle-filter');
  const filterContainer = document.getElementById('filter-container');
  const userFilterInput = document.getElementById('user-filter');
  const applyFilterBtn = document.getElementById('apply-filter');
  const filterBadges = document.getElementById('filter-badges');
  const sendMessageToggle = document.getElementById('send-message-toggle');
  const messageContainer = document.getElementById('message-container');
  const leaveMessageInput = document.getElementById('leave-message');
  
  // 更新日を表示 - 正しい日付に修正
  currentDateElement.textContent = "2025-05-27";
  
  // ソースコードURLを設定
  const sourceCodeUrl = "https://github.com/n4n45h1/GroupDM-Leaver";
  if (currentCodeElement) {
    currentCodeElement.textContent = sourceCodeUrl;
    currentCodeElement.href = sourceCodeUrl;
  }
  
  // 言語辞書
  const langDict = {
    'ja': {
      'title': 'Discord グループDM 自動退室ツール',
      'subtitle': '複数のDiscordグループDMを簡単に一括退室できます',
      'token-title': 'Discord ユーザートークンを入力',
      'token-desc': 'あなたのDiscordユーザートークンを入力して接続してください：',
      'token-placeholder': 'Discordユーザートークンを貼り付けてください',
      'connect': '接続',
      'disclaimer-1': '⚠️ このツールはブラウザ上でのみ実行されます。あなたのトークンがサーバーに送信されることはありません。',
      'disclaimer-2': '⚠️ 自己責任で使用してください。このツールはDiscordと提携していません。',
      'disclaimer-3': '⚠️ ユーザートークンの使用はDiscordの利用規約に違反する可能性があります。',
      'logout': 'ログアウト',
      'your-group-dms': 'あなたのグループDM',
      'refresh': '更新',
      'select-all': 'すべて選択',
      'deselect-all': '選択解除',
      'filter-title': '特定ユーザーによるフィルタリング',
      'toggle-filter': 'フィルターを表示',
      'toggle-filter-hide': 'フィルターを隠す',
      'user-filter-placeholder': 'ユーザー名またはIDを入力',
      'apply-filter': '適用',
      'filter-by': 'フィルター: ',
      'loading-dms': 'グループDMを読み込み中...',
      'no-groups': 'グループDMが見つかりませんでした。',
      'leave-message-title': '退室時のメッセージ',
      'send-message-toggle': 'メッセージを送信',
      'leave-message-placeholder': '退室時に送信するメッセージを入力してください',
      'leave-selected': '選択したグループDMを退室',
      'results': '結果',
      'created-by': '作成者: Nanachi',
      'updated-date': '更新日: ',
      'source-code': 'ソースコード: ',
      'confirm-title': '操作の確認',
      'confirm-message': '選択したグループDMから退室してもよろしいですか？この操作は元に戻せません。',
      'cancel': 'キャンセル',
      'proceed': '続行',
      'success-leave': 'から正常に退室しました',
      'error-leave': 'からの退室に失敗しました: ',
      'message-sent': 'メッセージを送信しました: ',
      'error-message': 'メッセージの送信に失敗しました: ',
      'filter-applied': 'フィルター適用: ユーザー ',
      'filter-removed': 'フィルターを削除: ユーザー ',
      'no-matching-dms': 'フィルター条件に一致するグループDMはありません',
      'bug-report': 'バグ報告:',
      'members': '人のメンバー: '
    },
    'en': {
      'title': 'Discord Group DM Auto-Leaver Tool',
      'subtitle': 'Easily leave multiple Discord group DMs at once',
      'token-title': 'Enter Discord User Token',
      'token-desc': 'Enter your Discord user token to connect:',
      'token-placeholder': 'Paste your Discord user token here',
      'connect': 'Connect',
      'disclaimer-1': '⚠️ This tool runs only in your browser. Your token will not be sent to any server.',
      'disclaimer-2': '⚠️ Use at your own risk. This tool is not affiliated with Discord.',
      'disclaimer-3': '⚠️ Using user tokens may violate Discord\'s Terms of Service.',
      'logout': 'Logout',
      'your-group-dms': 'Your Group DMs',
      'refresh': 'Refresh',
      'select-all': 'Select All',
      'deselect-all': 'Deselect All',
      'filter-title': 'Filter by Specific Users',
      'toggle-filter': 'Show Filter',
      'toggle-filter-hide': 'Hide Filter',
      'user-filter-placeholder': 'Enter username or ID',
      'apply-filter': 'Apply',
      'filter-by': 'Filter by: ',
      'loading-dms': 'Loading group DMs...',
      'no-groups': 'No group DMs found.',
      'leave-message-title': 'Leave Message',
      'send-message-toggle': 'Send Message',
      'leave-message-placeholder': 'Enter a message to send before leaving',
      'leave-selected': 'Leave Selected Group DMs',
      'results': 'Results',
      'created-by': 'Created by: Nanachi',
      'updated-date': 'Updated: ',
      'source-code': 'Source code: ',
      'confirm-title': 'Confirm Action',
      'confirm-message': 'Are you sure you want to leave the selected group DMs? This action cannot be undone.',
      'cancel': 'Cancel',
      'proceed': 'Proceed',
      'success-leave': 'successfully left',
      'error-leave': 'failed to leave: ',
      'message-sent': 'Message sent: ',
      'error-message': 'Failed to send message: ',
      'filter-applied': 'Filter applied: User ',
      'filter-removed': 'Filter removed: User ',
      'no-matching-dms': 'No group DMs match your filter criteria',
      'bug-report': 'Bug report:',
      'members': 'members: '
    }
  };
  
  // テーマ変更
  function setTheme(theme) {
    document.body.classList.remove('theme-dark', 'theme-light');
    document.body.classList.add(`theme-${theme}`);
    
    // テーマボタンの状態を更新
    themeDarkBtn.classList.remove('active');
    themeLightBtn.classList.remove('active');
    
    if (theme === 'dark') {
      themeDarkBtn.classList.add('active');
    } else {
      themeLightBtn.classList.add('active');
    }
    
    currentTheme = theme;
    localStorage.setItem('discord_theme', theme);
  }
  
  // 言語変更
  function setLanguage(lang) {
    currentLanguage = lang;
    
    // 言語ボタンの状態を更新
    langJaBtn.classList.remove('active');
    langEnBtn.classList.remove('active');
    
    if (lang === 'ja') {
      langJaBtn.classList.add('active');
      document.documentElement.setAttribute('lang', 'ja');
    } else {
      langEnBtn.classList.add('active');
      document.documentElement.setAttribute('lang', 'en');
    }
    
    // 全てのテキスト要素を更新
    document.querySelectorAll('[data-lang]').forEach(el => {
      const key = el.getAttribute('data-lang');
      if (langDict[lang][key]) {
        el.textContent = langDict[lang][key];
      }
    });
    
    // プレースホルダーを更新
    document.querySelectorAll('[data-lang-placeholder]').forEach(el => {
      const key = el.getAttribute('data-lang-placeholder');
      if (langDict[lang][key]) {
        el.placeholder = langDict[lang][key];
      }
    });
    
    localStorage.setItem('discord_language', lang);
  }
  
  // フィルター表示切替
  function toggleFilter() {
    if (filterContainer.classList.contains('hidden')) {
      filterContainer.classList.remove('hidden');
      toggleFilterBtn.querySelector('[data-lang]').textContent = langDict[currentLanguage]['toggle-filter-hide'];
    } else {
      filterContainer.classList.add('hidden');
      toggleFilterBtn.querySelector('[data-lang]').textContent = langDict[currentLanguage]['toggle-filter'];
    }
  }
  
  // メッセージ入力欄表示切替
  function toggleMessageInput() {
    if (sendMessageToggle.checked) {
      messageContainer.classList.remove('hidden');
    } else {
      messageContainer.classList.add('hidden');
    }
  }
  
  // フィルターバッジを追加
  function addFilterBadge(filterText) {
    if (userFilters.has(filterText.toLowerCase())) return;
    
    userFilters.add(filterText.toLowerCase());
    
    const badge = document.createElement('div');
    badge.className = 'filter-badge';
    badge.innerHTML = `
      ${filterText}
      <button class="badge-remove" data-filter="${filterText}">
        <i class="fas fa-times"></i>
      </button>
    `;
    
    filterBadges.appendChild(badge);
    
    // 削除ボタンのイベントリスナー
    badge.querySelector('.badge-remove').addEventListener('click', function() {
      const filter = this.getAttribute('data-filter');
      userFilters.delete(filter.toLowerCase());
      badge.remove();
      applyUserFilters();
    });
    
    applyUserFilters();
  }
  
  // ユーザーフィルターを適用
  function applyUserFilters() {
    if (userFilters.size === 0) {
      // フィルターなし、全てを表示
      displayGroupDMs(groupDMs);
      return;
    }
    
    // フィルターに一致するDMを検索
    const filteredDMs = groupDMs.filter(dm => {
      return dm.recipients.some(recipient => {
        return Array.from(userFilters).some(filter => {
          return recipient.username.toLowerCase().includes(filter) || 
                 recipient.id.toLowerCase().includes(filter);
        });
      });
    });
    
    if (filteredDMs.length === 0) {
      dmList.innerHTML = `<div class="no-matching-filter">${langDict[currentLanguage]['no-matching-dms']}</div>`;
    } else {
      displayGroupDMs(filteredDMs);
    }
  }
  
  // メッセージ送信関数
  async function sendMessage(channelId, message) {
    if (!message.trim()) return { success: true };
    
    try {
      const response = await fetch(`${API_ENDPOINT}/channels/${channelId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': userToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content: message
        })
      });
      
      if (!response.ok) {
        throw new Error(`メッセージ送信エラー: ${response.status}`);
      }
      
      return { success: true, message: message };
    } catch (error) {
      console.error(`チャネル ${channelId} へのメッセージ送信エラー:`, error);
      return { success: false, error: error.message };
    }
  }
  
  // 起動時に設定を読み込み
  function loadSettings() {
    // テーマを読み込み
    const savedTheme = localStorage.getItem('discord_theme') || 'dark';
    setTheme(savedTheme);
    
    // 言語を読み込み
    const savedLanguage = localStorage.getItem('discord_language') || 'ja';
    setLanguage(savedLanguage);
    
    // トークンをチェック
    checkStoredToken();
  }
  
  // 残りの関数 (既存の関数) ...
  
  // 起動時にローカルストレージからトークンをチェック
  function checkStoredToken() {
      const storedToken = localStorage.getItem('discord_user_token');
      if (storedToken) {
          setToken(storedToken);
      }
  }
  
  // トークンをセットしてUIを更新
  function setToken(token) {
      userToken = token;
      localStorage.setItem('discord_user_token', token);
      document.getElementById('token-container').classList.add('hidden');
      document.getElementById('user-info').classList.remove('hidden');
      document.getElementById('group-dm-container').classList.remove('hidden');
      
      fetchUserInfo();
      fetchGroupDMs();
  }
  
  // ログアウト機能
  function logout() {
      userToken = null;
      localStorage.removeItem('discord_user_token');
      selectedDMs.clear();
      userFilters.clear();
      groupDMs = [];
      
      document.getElementById('token-container').classList.remove('hidden');
      document.getElementById('user-info').classList.add('hidden');
      document.getElementById('group-dm-container').classList.add('hidden');
      document.getElementById('results-container').classList.add('hidden');
      
      dmList.innerHTML = '';
      resultsList.innerHTML = '';
      filterBadges.innerHTML = '';
  }
  
  // Discord APIからユーザー情報を取得
  async function fetchUserInfo() {
      try {
          const response = await fetch(`${API_ENDPOINT}/users/@me`, {
              headers: {
                  'Authorization': userToken
              }
          });
          
          if (!response.ok) {
              throw new Error(`ユーザー情報の取得エラー: ${response.status}`);
          }
          
          const userData = await response.json();
          
          document.getElementById('username').textContent = userData.username;
          document.getElementById('user-tag').textContent = `#${userData.discriminator}`;
          
          if (userData.avatar) {
              const avatarURL = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png`;
              document.getElementById('user-avatar').src = avatarURL;
          } else {
              // ユーザーがカスタムアバターを持っていない場合のデフォルト
              document.getElementById('user-avatar').src = 'https://cdn.discordapp.com/embed/avatars/0.png';
          }
          
      } catch (error) {
          console.error('ユーザー情報の取得に失敗しました:', error);
          showErrorMessage(currentLanguage === 'ja' ? 
                          'ユーザー情報の取得に失敗しました。トークンが正しいか確認してください。' : 
                          'Failed to get user information. Please check if your token is correct.');
          logout();
      }
  }
  
  // Discord APIからグループDMを取得
  async function fetchGroupDMs() {
      loading.classList.remove('hidden');
      noGroups.classList.add('hidden');
      dmList.innerHTML = '';
      
      try {
          const response = await fetch(`${API_ENDPOINT}/users/@me/channels`, {
              headers: {
                  'Authorization': userToken
              }
          });
          
          if (!response.ok) {
              throw new Error(`グループDMの取得エラー: ${response.status}`);
          }
          
          const channels = await response.json();
          
          // グループDMのみをフィルター (type 3)
          groupDMs = channels.filter(channel => channel.type === 3);
          
          loading.classList.add('hidden');
          
          if (groupDMs.length === 0) {
              noGroups.classList.remove('hidden');
              return;
          }
          
          // グループDMを表示
          applyUserFilters();
          
      } catch (error) {
          console.error('グループDMの取得に失敗しました:', error);
          loading.classList.add('hidden');
          showErrorMessage(currentLanguage === 'ja' ? 
                          'グループDMの取得に失敗しました。もう一度お試しください。' : 
                          'Failed to retrieve group DMs. Please try again.');
      }
  }
  
  // UIにグループDMを表示
  function displayGroupDMs(dms) {
      dmList.innerHTML = '';
      
      dms.forEach(dm => {
          const item = document.createElement('li');
          item.className = 'dm-item';
          item.dataset.id = dm.id;
          
          // 各DMのHTML構造を作成
          const recipientNames = dm.recipients.map(r => r.username).join(', ');
          
          // DMアイコンのイニシャルを作成
          const initials = dm.name 
              ? dm.name.split(' ').map(n => n[0]).join('').substring(0, 2)
              : recipientNames.split(',')[0].trim()[0];
          
          item.innerHTML = `
              <input type="checkbox" class="dm-checkbox" data-id="${dm.id}">
              <div class="dm-icon">${initials}</div>
              <div class="dm-details">
                  <div class="dm-name">${dm.name || (currentLanguage === 'ja' ? 'グループDM' : 'Group DM')}</div>
                  <div class="dm-members">${dm.recipients.length}${langDict[currentLanguage]['members']}${recipientNames}</div>
              </div>
          `;
          
          dmList.appendChild(item);
          
          // チェックボックスのイベントリスナーを追加
          const checkbox = item.querySelector('.dm-checkbox');
          checkbox.addEventListener('change', function() {
              if (this.checked) {
                  selectedDMs.add(this.dataset.id);
              } else {
                  selectedDMs.delete(this.dataset.id);
              }
              updateLeaveButtonStatus();
          });

          // 既に選択されていた場合チェックを入れる
          if (selectedDMs.has(dm.id)) {
              checkbox.checked = true;
          }
      });
      
      updateLeaveButtonStatus();
  }
  
  // 選択状況に基づいて退室ボタンのステータスを更新
  function updateLeaveButtonStatus() {
      if (selectedDMs.size > 0) {
          leaveSelectedButton.removeAttribute('disabled');
          leaveSelectedButton.classList.remove('disabled');
      } else {
          leaveSelectedButton.setAttribute('disabled', 'disabled');
          leaveSelectedButton.classList.add('disabled');
      }
  }
  
  // グループDMから退室
  async function leaveGroupDM(channelId) {
      try {
          // メッセージ送信が有効な場合
          if (sendMessageToggle.checked && leaveMessageInput.value.trim()) {
              const messageResult = await sendMessage(channelId, leaveMessageInput.value);
              // エラーがあってもそのまま退室処理を続行
          }
          
          const response = await fetch(`${API_ENDPOINT}/channels/${channelId}`, {
              method: 'DELETE',
              headers: {
                  'Authorization': userToken
              }
          });
          
          if (!response.ok) {
              throw new Error(`グループDMからの退室に失敗しました: ${response.status}`);
          }
          
          return {
              success: true,
              channelId: channelId,
              messageSent: sendMessageToggle.checked && leaveMessageInput.value.trim()
          };
      } catch (error) {
          console.error(`グループDM ${channelId} からの退室エラー:`, error);
          return {
              success: false,
              channelId: channelId,
              error: error.message
          };
      }
  }
  
  // 選択したすべてのグループDMから退室
  async function leaveSelectedGroupDMs() {
      if (selectedDMs.size === 0) return;
      
      resultsContainer.classList.remove('hidden');
      resultsList.innerHTML = '';
      
      // SetをArrayに変換して反復処理
      const dmsToLeave = Array.from(selectedDMs);
      
      // 各DMを処理
      for (const dmId of dmsToLeave) {
          const result = await leaveGroupDM(dmId);
          
          // 表示用のDM情報を検索
          const dm = groupDMs.find(d => d.id === dmId);
          const dmName = dm ? (dm.name || (currentLanguage === 'ja' ? 'グループDM' : 'Group DM')) : (currentLanguage === 'ja' ? '不明なグループDM' : 'Unknown Group DM');
          
          // 結果アイテムを作成
          const resultItem = document.createElement('li');
          resultItem.className = result.success ? 'success' : 'error';
          
          if (result.success) {
              let resultText = `"${dmName}" ${langDict[currentLanguage]['success-leave']}`;
              if (result.messageSent) {
                  resultText += `<br>${langDict[currentLanguage]['message-sent']}"${leaveMessageInput.value.substring(0, 30)}${leaveMessageInput.value.length > 30 ? '...' : ''}"`;
              }
              resultItem.innerHTML = `<i class="fas fa-check-circle"></i> ${resultText}`;
              
              // selectedDMsから削除
              selectedDMs.delete(dmId);
              // groupDMs配列から削除
              groupDMs = groupDMs.filter(d => d.id !== dmId);
              // DOMから削除
              const dmElement = document.querySelector(`.dm-item[data-id="${dmId}"]`);
              if (dmElement) dmElement.remove();
          } else {
              resultItem.innerHTML = `<i class="fas fa-times-circle"></i> "${dmName}" ${langDict[currentLanguage]['error-leave']}${result.error}`;
          }
          
          resultsList.appendChild(resultItem);
      }
      
      updateLeaveButtonStatus();
  }
  
  // エラーメッセージを表示
  function showErrorMessage(message) {
      resultsContainer.classList.remove('hidden');
      
      const errorItem = document.createElement('li');
      errorItem.className = 'error';
      errorItem.innerHTML = `<i class="fas fa-times-circle"></i> ${message}`;
      
      resultsList.appendChild(errorItem);
  }
  
  // イベントリスナー
  tokenSubmit.addEventListener('click', function() {
      const token = tokenInput.value.trim();
      if (token) {
          setToken(token);
      } else {
          showErrorMessage(currentLanguage === 'ja' ? 
                           '有効なDiscordトークンを入力してください。' : 
                           'Please enter a valid Discord token.');
      }
  });
  
  logoutButton.addEventListener('click', logout);
  
  refreshButton.addEventListener('click', fetchGroupDMs);
  
  selectAllButton.addEventListener('click', function() {
      document.querySelectorAll('.dm-checkbox').forEach(checkbox => {
          checkbox.checked = true;
          selectedDMs.add(checkbox.dataset.id);
      });
      updateLeaveButtonStatus();
  });
  
  deselectAllButton.addEventListener('click', function() {
      document.querySelectorAll('.dm-checkbox').forEach(checkbox => {
          checkbox.checked = false;
      });
      selectedDMs.clear();
      updateLeaveButtonStatus();
  });
  
  leaveSelectedButton.addEventListener('click', function() {
      if (selectedDMs.size > 0) {
          confirmModal.classList.remove('hidden');
      }
  });
  
  confirmCancel.addEventListener('click', function() {
      confirmModal.classList.add('hidden');
  });
  
  confirmProceed.addEventListener('click', function() {
      confirmModal.classList.add('hidden');
      leaveSelectedGroupDMs();
  });
  
  // 新機能のイベントリスナー
  langJaBtn.addEventListener('click', () => setLanguage('ja'));
  langEnBtn.addEventListener('click', () => setLanguage('en'));
  
  themeDarkBtn.addEventListener('click', () => setTheme('dark'));
  themeLightBtn.addEventListener('click', () => setTheme('light'));
  
  toggleFilterBtn.addEventListener('click', toggleFilter);
  
  applyFilterBtn.addEventListener('click', function() {
      const filterValue = userFilterInput.value.trim();
      if (filterValue) {
          addFilterBadge(filterValue);
          userFilterInput.value = '';
      }
  });
  
  userFilterInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
          const filterValue = userFilterInput.value.trim();
          if (filterValue) {
              addFilterBadge(filterValue);
              userFilterInput.value = '';
          }
      }
  });
  
  sendMessageToggle.addEventListener('change', toggleMessageInput);
  
  // Enterキーでトークン入力を送信
  tokenInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
          const token = tokenInput.value.trim();
          if (token) {
              setToken(token);
          }
      }
  });
  
  // 初期化
  loadSettings();
});

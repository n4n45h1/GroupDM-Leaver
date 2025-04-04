document.addEventListener('DOMContentLoaded', function() {
  // 定数と変数
  const API_ENDPOINT = 'https://discord.com/api/v9';
  
  let userToken = null;
  let groupDMs = [];
  let selectedDMs = new Set();
  
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
  
  // 更新日を表示
  currentDateElement.textContent = "2025-04-03";
  
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
      groupDMs = [];
      
      document.getElementById('token-container').classList.remove('hidden');
      document.getElementById('user-info').classList.add('hidden');
      document.getElementById('group-dm-container').classList.add('hidden');
      document.getElementById('results-container').classList.add('hidden');
      
      dmList.innerHTML = '';
      resultsList.innerHTML = '';
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
          showErrorMessage('ユーザー情報の取得に失敗しました。トークンが正しいか確認してください。');
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
          displayGroupDMs();
          
      } catch (error) {
          console.error('グループDMの取得に失敗しました:', error);
          loading.classList.add('hidden');
          showErrorMessage('グループDMの取得に失敗しました。もう一度お試しください。');
      }
  }
  
  // UIにグループDMを表示
  function displayGroupDMs() {
      dmList.innerHTML = '';
      selectedDMs.clear();
      
      groupDMs.forEach(dm => {
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
                  <div class="dm-name">${dm.name || 'グループDM'}</div>
                  <div class="dm-members">${dm.recipients.length}人のメンバー: ${recipientNames}</div>
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
              channelId: channelId
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
          const dmName = dm ? (dm.name || 'グループDM') : '不明なグループDM';
          
          // 結果アイテムを作成
          const resultItem = document.createElement('li');
          resultItem.className = result.success ? 'success' : 'error';
          
          if (result.success) {
              resultItem.innerHTML = `
                  <i class="fas fa-check-circle"></i> 
                  "${dmName}" から正常に退室しました
              `;
              // selectedDMsから削除
              selectedDMs.delete(dmId);
              // groupDMs配列から削除
              groupDMs = groupDMs.filter(d => d.id !== dmId);
              // DOMから削除
              const dmElement = document.querySelector(`.dm-item[data-id="${dmId}"]`);
              if (dmElement) dmElement.remove();
          } else {
              resultItem.innerHTML = `
                  <i class="fas fa-times-circle"></i> 
                  "${dmName}" からの退室に失敗しました: ${result.error}
              `;
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
          showErrorMessage('有効なDiscordトークンを入力してください。');
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
  
  // 初期化
  checkStoredToken();
});
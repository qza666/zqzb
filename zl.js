// ==UserScript==
// @name         ig客户资料登记
// @namespace    https://github.com/qza666/
// @version      1.1
// @description  Instagram客户资料管理+翻译
// @author       发财
// @match        *instagram.com/direct*
// @grant        GM_xmlhttpRequest
// @connect      205.189.160.50
// ==/UserScript==


(function() {
    'use strict';

    let currentUserId = null;
    let currentUsername = null;
    let isProfileLoaded = false;
    let currentTab = 'customer'; // 'customer' 或 'girl'

    // 状态颜色配置
    const statusColors = {
        '活跃': '#4CAF50',
        '冷聊': '#FF9800',
        '死了': '#F44336',
        '默认': '#FFFFFF'
    };

    // 创建样式
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .profile-manager-btn {
            cursor: pointer;
            border-radius: 50%;
            padding: 12px;
            box-shadow: 0 3px 12px rgba(0,0,0,0.2);
            transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .profile-manager-btn:hover {
            transform: scale(1.1);
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        }

        .profile-panel {
            position: fixed;
            right: 0;
            top: 0;
            width: 0;
            height: 100vh;
            background: white;
            border-left: 1px solid #ddd;
            z-index: 9999;
            transition: width 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            box-shadow: -5px 0 25px rgba(0,0,0,0.1);
        }

        .profile-panel.open {
            width: 400px;
        }

        .profile-header {
            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            padding: 15px;
            color: white;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid rgba(255,255,255,0.1);
        }

        .profile-title {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
        }

        .profile-toggle-btn {
            background: rgba(255,255,255,0.2);
            border: none;
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            color: white;
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .profile-toggle-btn:hover {
            background: rgba(255,255,255,0.4);
            transform: rotate(180deg);
        }

        .profile-user-info {
            padding: 10px 15px;
            background: #f0f2f5;
            border-bottom: 1px solid #ddd;
            font-size: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .profile-user-info div {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .profile-tabs {
            display: flex;
            background: #f8f9fa;
            border-bottom: 1px solid #ddd;
        }

        .profile-tab {
            flex: 1;
            padding: 12px;
            text-align: center;
            background: none;
            border: none;
            cursor: pointer;
            font-size: 13px;
            font-weight: 500;
            color: #666;
            transition: all 0.3s ease;
            position: relative;
        }

        .profile-tab.active {
            color: #2196F3;
            background: white;
        }

        .profile-tab.active::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 2px;
            background: #2196F3;
        }

        .profile-tab:hover:not(.active) {
            background: #e9ecef;
        }

        .profile-content {
            flex: 1;
            overflow-y: auto;
            padding: 15px;
            background: #fafafa;
        }

        .profile-tab-content {
            display: none;
        }

        .profile-tab-content.active {
            display: block;
        }

        .profile-section {
            margin-bottom: 20px;
            background: white;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .profile-section-title {
            margin: 0 0 15px 0;
            padding: 0 0 8px 0;
            border-bottom: 2px solid;
            font-size: 14px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .customer-title {
            color: #2196F3;
            border-color: #2196F3;
        }

        .girl-title {
            color: #E91E63;
            border-color: #E91E63;
        }

        .topics-title {
            color: #FF9800;
            border-color: #FF9800;
        }

        .profile-input {
            padding: 8px 10px;
            border: 1px solid #e1e1e1;
            border-radius: 6px;
            font-size: 13px;
            width: 100%;
            transition: border 0.3s ease;
            margin-bottom: 8px;
        }

        .profile-input:focus {
            border-color: #2196F3;
            outline: none;
            box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
        }

        .profile-textarea {
            padding: 8px 10px;
            border: 1px solid #e1e1e1;
            border-radius: 6px;
            font-size: 13px;
            width: 100%;
            transition: border 0.3s ease;
            resize: vertical;
            min-height: 50px;
            margin-bottom: 8px;
        }

        .profile-textarea:focus {
            border-color: #2196F3;
            outline: none;
            box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
        }

        .profile-select {
            padding: 8px 10px;
            border: 1px solid #e1e1e1;
            border-radius: 6px;
            font-size: 13px;
            width: 100%;
            transition: border 0.3s ease;
            background: white;
            margin-bottom: 8px;
        }

        .profile-select:focus {
            border-color: #2196F3;
            outline: none;
        }

        .profile-footer {
            padding: 12px 15px;
            border-top: 1px solid #ddd;
            background: #f0f2f5;
            display: flex;
            gap: 8px;
        }

        .profile-btn {
            padding: 10px;
            border: none;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
        }

        .profile-btn-primary {
            background: #2196F3;
            color: white;
            flex: 2;
        }

        .profile-btn-primary:hover {
            background: #1976D2;
        }

        .profile-btn-secondary {
            background: #f0f2f5;
            color: #333;
            border: 1px solid #ddd;
            flex: 1;
        }

        .profile-btn-secondary:hover {
            background: #e4e6e9;
        }

        .profile-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
        }

        .profile-label {
            display: block;
            margin-bottom: 4px;
            font-size: 11px;
            color: #666;
            font-weight: 500;
        }

        .profile-notification {
            position: fixed;
            bottom: 20px;
            right: 420px;
            background: #4CAF50;
            color: white;
            padding: 10px 16px;
            border-radius: 6px;
            font-size: 13px;
            box-shadow: 0 3px 10px rgba(0,0,0,0.2);
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s ease;
            z-index: 10002;
        }

        .profile-notification.show {
            transform: translateY(0);
            opacity: 1;
        }

        .profile-notification.panel-closed {
            right: 20px;
        }

        /* 自定义滚动条 */
        .profile-content::-webkit-scrollbar {
            width: 6px;
        }

        .profile-content::-webkit-scrollbar-track {
            background: #f1f1f1;
        }

        .profile-content::-webkit-scrollbar-thumb {
            background: #c1c1c1;
            border-radius: 3px;
        }

        .profile-content::-webkit-scrollbar-thumb:hover {
            background: #a1a1a1;
        }

        /* 动画效果 */
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }

        .pulse-animation {
            animation: pulse 0.5s;
        }

        /* 调整Instagram主界面宽度 */
        body.profile-panel-open {
            margin-right: 400px;
        }

        /* 响应式调整 */
        @media (max-width: 1200px) {
            .profile-panel.open {
                width: 350px;
            }

            body.profile-panel-open {
                margin-right: 350px;
            }

            .profile-notification {
                right: 370px;
            }
        }
    `;
    document.head.appendChild(styleElement);

    // 创建悬浮按钮容器
    const floatingButtonContainer = document.createElement('div');
    floatingButtonContainer.style.position = 'fixed';
    floatingButtonContainer.style.right = '20px';
    floatingButtonContainer.style.top = '50%';
    floatingButtonContainer.style.transform = 'translateY(-50%)';
    floatingButtonContainer.style.zIndex = '10001';
    floatingButtonContainer.style.display = 'none';
    document.body.appendChild(floatingButtonContainer);

    // 创建按钮HTML
    floatingButtonContainer.innerHTML = `
        <div id="profileButton" class="profile-manager-btn" style="background: white;">
            <svg aria-label="客户资料" fill="currentColor" height="24" role="img" viewBox="0 0 24 24" width="24">
                <title>客户资料</title>
                <path d="M12.202 3.203H5.25a3 3 0 0 0-3 3V18.75a3 3 0 0 0 3 3h12.547a3 3 0 0 0 3-3v-6.952" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                <path d="M10.002 17.226H6.774v-3.228L18.607 2.165a1.417 1.417 0 0 1 2.004 0l1.224 1.225a1.417 1.417 0 0 1 0 2.004Z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"></path>
                <line fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" x1="16.848" x2="20.076" y1="3.924" y2="7.153"></line>
            </svg>
        </div>
    `;

    // 创建通知元素
    const notificationElement = document.createElement('div');
    notificationElement.className = 'profile-notification';
    notificationElement.textContent = '操作成功！';
    document.body.appendChild(notificationElement);

    // 创建右侧面板
    const profilePanel = document.createElement('div');
    profilePanel.id = 'profilePanel';
    profilePanel.className = 'profile-panel';

    profilePanel.innerHTML = `
        <div style="height: 100%; display: flex; flex-direction: column;">
            <!-- 标题栏 -->
            <div class="profile-header">
                <h3 class="profile-title">客户资料管理</h3>
                <button id="toggleProfile" class="profile-toggle-btn">
                    <svg height="16" width="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
            </div>

            <!-- 用户信息显示 -->
            <div class="profile-user-info">
                <div>
                    <svg height="14" width="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <span id="displayUsername">-</span>
                </div>
                <div>
                    <span id="displayUserId">-</span>
                    <button id="copyUserId" style="background: none; border: none; cursor: pointer; padding: 2px; margin-left: 4px;">
                        <svg height="12" width="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- 状态选择 -->
            <div style="padding: 10px 15px; background: white; border-bottom: 1px solid #ddd;">
                <label class="profile-label">客户状态</label>
                <select id="customerStatus" class="profile-select">
                    <option value="默认">选择状态</option>
                    <option value="活跃">活跃</option>
                    <option value="冷聊">冷聊</option>
                    <option value="死了">死了</option>
                </select>
            </div>

            <!-- 标签页 -->
            <div class="profile-tabs">
                <button class="profile-tab active" data-tab="customer">
                    <svg height="14" width="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    客户资料
                </button>
                <button class="profile-tab" data-tab="girl">
                    <svg height="14" width="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    女主资料
                </button>
                <button class="profile-tab" data-tab="topics">
                    <svg height="14" width="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                    </svg>
                    聊天话题
                </button>
            </div>

            <!-- 内容区域 -->
            <div class="profile-content">
                <!-- 客户资料标签页 -->
                <div id="customerTab" class="profile-tab-content active">
                    <div class="profile-section">
                        <div class="profile-grid">
                            <div>
                                <label class="profile-label">姓名</label>
                                <input type="text" id="customerName" placeholder="姓名" class="profile-input">
                            </div>
                            <div>
                                <label class="profile-label">年龄</label>
                                <input type="text" id="customerAge" placeholder="年龄" class="profile-input">
                            </div>
                        </div>
                        <div class="profile-grid">
                            <div>
                                <label class="profile-label">工作</label>
                                <input type="text" id="customerWork" placeholder="工作" class="profile-input">
                            </div>
                            <div>
                                <label class="profile-label">地址</label>
                                <input type="text" id="customerAddress" placeholder="地址" class="profile-input">
                            </div>
                        </div>
                        <div class="profile-grid">
                            <div>
                                <label class="profile-label">婚姻状况</label>
                                <input type="text" id="customerMarriage" placeholder="婚姻状况" class="profile-input">
                            </div>
                            <div>
                                <label class="profile-label">作息时间</label>
                                <input type="text" id="customerSchedule" placeholder="作息时间" class="profile-input">
                            </div>
                        </div>
                        <div>
                            <label class="profile-label">工作经历</label>
                            <textarea id="customerWorkHistory" placeholder="工作经历" class="profile-textarea"></textarea>
                        </div>
                        <div>
                            <label class="profile-label">家庭成员</label>
                            <textarea id="customerFamily" placeholder="家庭成员" class="profile-textarea"></textarea>
                        </div>
                        <div>
                            <label class="profile-label">爱好</label>
                            <textarea id="customerHobbies" placeholder="爱好" class="profile-textarea"></textarea>
                        </div>
                        <div>
                            <label class="profile-label">经济情况</label>
                            <textarea id="customerEconomic" placeholder="经济情况" class="profile-textarea"></textarea>
                        </div>
                        <div>
                            <label class="profile-label">其他信息</label>
                            <textarea id="customerOther" placeholder="其他信息" class="profile-textarea"></textarea>
                        </div>
                    </div>
                </div>

                <!-- 女主资料标签页 -->
                <div id="girlTab" class="profile-tab-content">
                    <div class="profile-section">
                        <div class="profile-grid">
                            <div>
                                <label class="profile-label">姓名</label>
                                <input type="text" id="girlName" placeholder="姓名" class="profile-input">
                            </div>
                            <div>
                                <label class="profile-label">年龄</label>
                                <input type="text" id="girlAge" placeholder="年龄" class="profile-input">
                            </div>
                        </div>
                        <div class="profile-grid">
                            <div>
                                <label class="profile-label">工作</label>
                                <input type="text" id="girlWork" placeholder="工作" class="profile-input">
                            </div>
                            <div>
                                <label class="profile-label">地址</label>
                                <input type="text" id="girlAddress" placeholder="地址" class="profile-input">
                            </div>
                        </div>
                        <div class="profile-grid">
                            <div>
                                <label class="profile-label">婚姻状况</label>
                                <input type="text" id="girlMarriage" placeholder="婚姻状况" class="profile-input">
                            </div>
                            <div>
                                <label class="profile-label">作息时间</label>
                                <input type="text" id="girlSchedule" placeholder="作息时间" class="profile-input">
                            </div>
                        </div>
                        <div>
                            <label class="profile-label">工作经历</label>
                            <textarea id="girlWorkHistory" placeholder="工作经历" class="profile-textarea"></textarea>
                        </div>
                        <div>
                            <label class="profile-label">家庭成员</label>
                            <textarea id="girlFamily" placeholder="家庭成员" class="profile-textarea"></textarea>
                        </div>
                        <div>
                            <label class="profile-label">爱好</label>
                            <textarea id="girlHobbies" placeholder="爱好" class="profile-textarea"></textarea>
                        </div>
                        <div>
                            <label class="profile-label">经济情况</label>
                            <textarea id="girlEconomic" placeholder="经济情况" class="profile-textarea"></textarea>
                        </div>
                        <div>
                            <label class="profile-label">其他信息</label>
                            <textarea id="girlOther" placeholder="其他信息" class="profile-textarea"></textarea>
                        </div>
                    </div>
                </div>

                <!-- 聊天话题标签页 -->
                <div id="topicsTab" class="profile-tab-content">
                    <div class="profile-section">
                        <div>
                            <label class="profile-label">聊过的话题</label>
                            <textarea id="chatTopics" placeholder="记录聊过的话题..." class="profile-textarea" style="height: 200px;"></textarea>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 底部按钮 -->
            <div class="profile-footer">
                <button id="saveProfile" class="profile-btn profile-btn-primary">
                    <svg height="14" width="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                        <polyline points="17 21 17 13 7 13 7 21"></polyline>
                        <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    保存
                </button>
                <button id="copyProfile" class="profile-btn profile-btn-secondary">
                    <svg height="14" width="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                    复制
                </button>
                <button id="exportProfile" class="profile-btn profile-btn-secondary">
                    <svg height="14" width="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    导出
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(profilePanel);

    // 显示通知函数
    function showNotification(message, type = 'success') {
        notificationElement.textContent = message;

        if (type === 'success') {
            notificationElement.style.background = '#4CAF50';
        } else if (type === 'error') {
            notificationElement.style.background = '#F44336';
        } else if (type === 'info') {
            notificationElement.style.background = '#2196F3';
        }

        // 根据面板状态调整通知位置
        if (profilePanel.classList.contains('open')) {
            notificationElement.classList.remove('panel-closed');
        } else {
            notificationElement.classList.add('panel-closed');
        }

        notificationElement.classList.add('show');

        setTimeout(() => {
            notificationElement.classList.remove('show');
        }, 3000);
    }

    // 标签页切换函数
    function switchTab(tabName) {
        // 更新标签按钮状态
        document.querySelectorAll('.profile-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // 更新内容区域
        document.querySelectorAll('.profile-tab-content').forEach(content => {
            content.classList.remove('active');
        });

        if (tabName === 'customer') {
            document.getElementById('customerTab').classList.add('active');
        } else if (tabName === 'girl') {
            document.getElementById('girlTab').classList.add('active');
        } else if (tabName === 'topics') {
            document.getElementById('topicsTab').classList.add('active');
        }

        currentTab = tabName;
    }

    // 数据管理函数
    function saveProfileData(userId, data) {
        try {
            const profiles = JSON.parse(localStorage.getItem('instagramProfiles') || '{}');
            profiles[userId] = {
                ...data,
                lastUpdated: new Date().toISOString()
            };
            localStorage.setItem('instagramProfiles', JSON.stringify(profiles));
            return true;
        } catch (error) {
            console.error('保存数据失败:', error);
            return false;
        }
    }

    function loadProfileData(userId) {
        try {
            const profiles = JSON.parse(localStorage.getItem('instagramProfiles') || '{}');
            return profiles[userId] || {};
        } catch (error) {
            console.error('加载数据失败:', error);
            return {};
        }
    }

    function updateButtonColor(status) {
        const button = document.getElementById('profileButton');
        const color = statusColors[status] || statusColors['默认'];
        button.style.background = color;

        // 如果是白色背景，文字用深色
        if (color === '#FFFFFF') {
            button.style.color = '#333';
        } else {
            button.style.color = 'white';
        }

        // 添加脉冲动画效果
        button.classList.add('pulse-animation');
        setTimeout(() => {
            button.classList.remove('pulse-animation');
        }, 500);
    }

    function populateForm(data) {
        // 基本信息
        document.getElementById('customerStatus').value = data.customerStatus || '默认';

        // 客户信息
        document.getElementById('customerName').value = data.customerName || '';
        document.getElementById('customerAge').value = data.customerAge || '';
        document.getElementById('customerWork').value = data.customerWork || '';
        document.getElementById('customerAddress').value = data.customerAddress || '';
        document.getElementById('customerMarriage').value = data.customerMarriage || '';
        document.getElementById('customerSchedule').value = data.customerSchedule || '';
        document.getElementById('customerWorkHistory').value = data.customerWorkHistory || '';
        document.getElementById('customerFamily').value = data.customerFamily || '';
        document.getElementById('customerHobbies').value = data.customerHobbies || '';
        document.getElementById('customerEconomic').value = data.customerEconomic || '';
        document.getElementById('customerOther').value = data.customerOther || '';

        // 女主信息
        document.getElementById('girlName').value = data.girlName || '';
        document.getElementById('girlAge').value = data.girlAge || '';
        document.getElementById('girlWork').value = data.girlWork || '';
        document.getElementById('girlAddress').value = data.girlAddress || '';
        document.getElementById('girlMarriage').value = data.girlMarriage || '';
        document.getElementById('girlSchedule').value = data.girlSchedule || '';
        document.getElementById('girlWorkHistory').value = data.girlWorkHistory || '';
        document.getElementById('girlFamily').value = data.girlFamily || '';
        document.getElementById('girlHobbies').value = data.girlHobbies || '';
        document.getElementById('girlEconomic').value = data.girlEconomic || '';
        document.getElementById('girlOther').value = data.girlOther || '';

        // 聊过的话题
        document.getElementById('chatTopics').value = data.chatTopics || '';

        // 更新按钮颜色
        updateButtonColor(data.customerStatus);
    }

    function collectFormData() {
        return {
            customerStatus: document.getElementById('customerStatus').value,
            customerName: document.getElementById('customerName').value,
            customerAge: document.getElementById('customerAge').value,
            customerWork: document.getElementById('customerWork').value,
            customerAddress: document.getElementById('customerAddress').value,
            customerMarriage: document.getElementById('customerMarriage').value,
            customerSchedule: document.getElementById('customerSchedule').value,
            customerWorkHistory: document.getElementById('customerWorkHistory').value,
            customerFamily: document.getElementById('customerFamily').value,
            customerHobbies: document.getElementById('customerHobbies').value,
            customerEconomic: document.getElementById('customerEconomic').value,
            customerOther: document.getElementById('customerOther').value,
            girlName: document.getElementById('girlName').value,
            girlAge: document.getElementById('girlAge').value,
            girlWork: document.getElementById('girlWork').value,
            girlAddress: document.getElementById('girlAddress').value,
            girlMarriage: document.getElementById('girlMarriage').value,
            girlSchedule: document.getElementById('girlSchedule').value,
            girlWorkHistory: document.getElementById('girlWorkHistory').value,
            girlFamily: document.getElementById('girlFamily').value,
            girlHobbies: document.getElementById('girlHobbies').value,
            girlEconomic: document.getElementById('girlEconomic').value,
            girlOther: document.getElementById('girlOther').value,
            chatTopics: document.getElementById('chatTopics').value,
            username: currentUsername,
            userId: currentUserId
        };
    }

    // 格式化资料为文本
    function formatProfileAsText(data) {
        let text = `【客户资料】\n`;
        text += `账号: ${data.username || '-'}\n`;
        text += `ID: ${data.userId || '-'}\n`;
        text += `状态: ${data.customerStatus || '-'}\n\n`;

        text += `【客户信息】\n`;
        text += `姓名: ${data.customerName || '-'}\n`;
        text += `年龄: ${data.customerAge || '-'}\n`;
        text += `工作: ${data.customerWork || '-'}\n`;
        text += `地址: ${data.customerAddress || '-'}\n`;
        text += `婚姻: ${data.customerMarriage || '-'}\n`;
        text += `作息: ${data.customerSchedule || '-'}\n`;
        text += `工作经历: ${data.customerWorkHistory || '-'}\n`;
        text += `家庭成员: ${data.customerFamily || '-'}\n`;
        text += `爱好: ${data.customerHobbies || '-'}\n`;
        text += `经济情况: ${data.customerEconomic || '-'}\n`;
        text += `其他信息: ${data.customerOther || '-'}\n\n`;

        text += `【女主信息】\n`;
        text += `姓名: ${data.girlName || '-'}\n`;
        text += `年龄: ${data.girlAge || '-'}\n`;
        text += `工作: ${data.girlWork || '-'}\n`;
        text += `地址: ${data.girlAddress || '-'}\n`;
        text += `婚姻: ${data.girlMarriage || '-'}\n`;
        text += `作息: ${data.girlSchedule || '-'}\n`;
        text += `工作经历: ${data.girlWorkHistory || '-'}\n`;
        text += `家庭成员: ${data.girlFamily || '-'}\n`;
        text += `爱好: ${data.girlHobbies || '-'}\n`;
        text += `经济情况: ${data.girlEconomic || '-'}\n`;
        text += `其他信息: ${data.girlOther || '-'}\n\n`;

        text += `【聊过的话题】\n${data.chatTopics || '-'}\n`;

        return text;
    }

    // 导出资料为JSON文件
    function exportProfileAsJSON(data) {
        const jsonData = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${data.username || 'customer'}_profile.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 获取用户信息并更新界面
    function getUserInfo(callback) {
        const usernameElement = document.querySelector(".x1qjc9v5.x1oa3qoh.x1nhvcw1 > div > span > span");
        const username = usernameElement?.textContent;

        if (!username) {
            console.log("无法获取用户名");
            return;
        }

        // 如果用户名没变，不重复获取
        if (username === currentUsername && isProfileLoaded) {
            if (typeof callback === 'function') callback();
            return;
        }

        console.log(`获取账号: ${username}`);

        currentUsername = username;
        document.getElementById('displayUsername').textContent = username;

        // 使用GM_xmlhttpRequest获取用户ID
        window.GM_xmlhttpRequest({
            method: "POST",
            url: "https://www.instagram.com/ajax/navigation/",
            headers: {
                "User-Agent": navigator.userAgent,
                "Content-Type": "application/x-www-form-urlencoded",
                "sec-fetch-site": "same-origin",
                "x-fb-lsd": "1"
            },
            data: `route_url=/${username}/&__a=1&__comet_req=7&lsd=1`,
            anonymous: true,
            onload: function(response) {
                const idMatch = response.responseText.match(/"id":"(\d+)"/);
                const id = idMatch ? idMatch[1] : '未找到ID';

                currentUserId = id;
                document.getElementById('displayUserId').textContent = id;
                console.log(`账号: ${username}, ID: ${id}`);

                // 加载该用户的资料数据
                if (id !== '未找到ID') {
                    const profileData = loadProfileData(id);
                    populateForm(profileData);
                    isProfileLoaded = true;

                    if (typeof callback === 'function') callback();
                }
            },
            onerror: function(error) {
                console.log(`获取ID失败: ${error.statusText}`);
                if (typeof callback === 'function') callback();
            }
        });
    }

    // 事件监听器
    document.getElementById('profileButton').addEventListener('click', () => {
        getUserInfo(() => {
            profilePanel.classList.add('open');
            document.body.classList.add('profile-panel-open');
        });
    });

    document.getElementById('toggleProfile').addEventListener('click', () => {
        profilePanel.classList.toggle('open');
        document.body.classList.toggle('profile-panel-open');
    });

    // 标签页切换事件
    document.querySelectorAll('.profile-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            switchTab(tabName);
        });
    });

    document.getElementById('saveProfile').addEventListener('click', () => {
        if (!currentUserId || currentUserId === '未找到ID') {
            showNotification('无法保存：用户ID无效', 'error');
            return;
        }

        const formData = collectFormData();
        const success = saveProfileData(currentUserId, formData);

        if (success) {
            updateButtonColor(formData.customerStatus);
            showNotification('资料保存成功！');
        } else {
            showNotification('保存失败，请重试', 'error');
        }
    });

    // 复制资料到剪贴板
    document.getElementById('copyProfile').addEventListener('click', () => {
        const formData = collectFormData();
        const formattedText = formatProfileAsText(formData);

        navigator.clipboard.writeText(formattedText)
            .then(() => {
                showNotification('资料已复制到剪贴板');
            })
            .catch(err => {
                console.error('复制失败:', err);
                showNotification('复制失败，请重试', 'error');
            });
    });

    // 导出资料为JSON文件
    document.getElementById('exportProfile').addEventListener('click', () => {
        const formData = collectFormData();
        exportProfileAsJSON(formData);
        showNotification('资料已导出为JSON文件');
    });

    // 复制用户ID
    document.getElementById('copyUserId').addEventListener('click', () => {
        const userId = document.getElementById('displayUserId').textContent;

        if (userId && userId !== '-') {
            navigator.clipboard.writeText(userId)
                .then(() => {
                    showNotification('用户ID已复制到剪贴板', 'info');
                })
                .catch(err => {
                    console.error('复制失败:', err);
                    showNotification('复制失败，请重试', 'error');
                });
        }
    });

    // 状态变化时更新按钮颜色
    document.getElementById('customerStatus').addEventListener('change', (e) => {
        updateButtonColor(e.target.value);
    });

    // URL监控函数
    function checkURL() {
        const currentURL = window.location.href;
        const isDirectMessageURL = /https:\/\/www\.instagram\.com\/direct\/t\//.test(currentURL);

        if (isDirectMessageURL) {
            floatingButtonContainer.style.display = 'block';

            // URL变化时自动获取用户信息并更新按钮颜色
            setTimeout(() => {
                getUserInfo();
            }, 1000);
        } else {
            floatingButtonContainer.style.display = 'none';
            profilePanel.classList.remove('open');
            document.body.classList.remove('profile-panel-open');
            isProfileLoaded = false;
        }
    }

    // 初始检查
    checkURL();

    // 使用MutationObserver监控URL变化
    let lastURL = window.location.href;
    const observer = new MutationObserver(() => {
        if (window.location.href !== lastURL) {
            lastURL = window.location.href;
            checkURL();
        }
    });

    observer.observe(document, { subtree: true, childList: true });
})();



(function () {
  'use strict';

  const API_URL = "http://205.189.160.50:5555/translate";
  const SELECTOR = ".x10wlt62>div>span>div";
  const CACHE_KEY = "translation_cache_v1";

  // 加载本地缓存
  let translationCache = {};
  try {
    const saved = localStorage.getItem(CACHE_KEY);
    if (saved) translationCache = JSON.parse(saved);
  } catch (e) {
    console.warn("翻译缓存读取失败", e);
  }

  // 保存缓存到 localStorage
  function saveCache() {
    localStorage.setItem(CACHE_KEY, JSON.stringify(translationCache));
  }

  // 翻译一个元素
  function translateElement(e) {
    if (e.__translating) return; // 正在翻译中
    const originalText = e.textContent.trim();
    if (!originalText) return;

    // 如果已有翻译结果，则跳过
    if (e.__translated && e.dataset.translationText === originalText) return;

    e.__translating = true;
    e.dataset.translationText = originalText;

    // 如果已有翻译框，先移除旧的
    const oldDiv = e.querySelector(".translation-result");
    if (oldDiv) oldDiv.remove();

    // 创建翻译显示容器
    const d = document.createElement("div");
    d.className = "translation-result";
    Object.assign(d.style, {
      background: "rgba(220,220,220,0.2)",
      padding: "4px",
      fontSize: "smaller",
      marginTop: "4px",
      cursor: "default",
      userSelect: "text",
    });
    d.textContent = "翻译中...";
    e.appendChild(d);

    // 缓存命中
    if (translationCache[originalText]) {
      d.textContent = translationCache[originalText];
      e.__translated = true;
      e.__translating = false;
      return;
    }

    // 错误重试处理
    function showRetry() {
      d.textContent = "翻译出错，点击重试";
      d.style.cursor = "pointer";
      d.onclick = () => {
        e.__translating = false;
        translateElement(e);
      };
    }

    // 发出翻译请求
    GM_xmlhttpRequest({
      method: "POST",
      url: API_URL,
      headers: { "Content-Type": "application/json" },
      data: JSON.stringify({
        text: originalText,
        target_lang: "zh",
        preserve_formatting: true,
      }),
      onload(response) {
        try {
          const data = JSON.parse(response.responseText);
          const translated = data.translated_text?.trim() || "";
          if (translated) {
            d.textContent = translated;
            d.style.cursor = "default";
            d.onclick = null;
            e.__translated = true;
            // 缓存翻译结果
            translationCache[originalText] = translated;
            saveCache();
          } else {
            showRetry();
          }
        } catch (err) {
          console.error("翻译失败解析错误", err);
          showRetry();
        } finally {
          e.__translating = false;
        }
      },
      onerror() {
        console.error("翻译失败 onerror");
        showRetry();
        e.__translating = false;
      },
      ontimeout() {
        console.error("翻译失败 timeout");
        showRetry();
        e.__translating = false;
      },
    });
  }

  // 扫描已有节点
  function scanAndTranslate(root = document) {
    root.querySelectorAll(SELECTOR).forEach(translateElement);
  }

  // 初次扫描
  scanAndTranslate();

  // 观察 DOM 变化
  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((node) => {
        if (!(node instanceof HTMLElement)) return;
        if (node.matches(SELECTOR)) translateElement(node);
        else scanAndTranslate(node);
      });
      if (m.type === "characterData" && m.target.parentElement) {
        const parent = m.target.parentElement;
        if (parent.matches && parent.matches(SELECTOR)) {
          parent.__translated = false;
          translateElement(parent);
        }
      }
    }
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
})();



// CVAT Annotation Analytics Client Script (Items 2-4)
(function () {
  console.log('[Analytics] Live analytics module active.');

  // Permanently hide the premium placeholder banner via CSS
  const style = document.createElement('style');
  style.id = 'cvat-analytics-override-css';
  style.textContent = `
    .cvat-paid-feature-placeholder-wrapper,
    .cvat-paid-feature-placeholder {
      display: none !important;
      visibility: hidden !important;
      height: 0 !important;
      overflow: hidden !important;
    }
  `;
  if (!document.getElementById('cvat-analytics-override-css')) {
    document.head.appendChild(style);
  }

  function injectAnalytics() {
    // Remove any premium placeholder immediately
    document.querySelectorAll('.cvat-paid-feature-placeholder-wrapper, .cvat-paid-feature-placeholder').forEach(function (el) {
      el.remove();
    });

    const path = window.location.pathname;

    // Case 1: On dedicated analytics route /tasks/:id/analytics
    const analyticsMatch = path.match(/\/tasks\/(\d+)\/analytics/);
    if (analyticsMatch) {
      const taskId = analyticsMatch[1];
      renderAnalyticsPage(taskId);
      return;
    }

    // Case 2: On main task page /tasks/:id
    const taskMatch = path.match(/\/tasks\/(\d+)$/);
    if (taskMatch) {
      const taskId = taskMatch[1];
      injectTaskAnalyticsSection(taskId);
    }
  }

  // 1. Dedicated Analytics Route (/tasks/:id/analytics)
  function renderAnalyticsPage(taskId) {
    // Remove any remaining paid placeholders
    document.querySelectorAll('.cvat-paid-feature-placeholder-wrapper, .cvat-paid-feature-placeholder').forEach(function (el) {
      el.remove();
    });

    const existing = document.getElementById('cvat-analytics-container');
    if (existing && existing.dataset.taskId === taskId) return;

    // Only inject inside CVAT's inner analytics container or inner wrapper
    const inner = document.querySelector('.cvat-analytics-inner') || document.querySelector('.cvat-analytics-inner-wrapper');

    if (!inner) {
      // If layout hasn't mounted yet, wait for next tick
      return;
    }

    if (existing) existing.remove();

    const container = document.createElement('div');
    container.id = 'cvat-analytics-container';
    container.dataset.taskId = taskId;
    container.style.width = '100%';
    container.style.marginTop = '16px';

    container.innerHTML = getAnalyticsCardHTML(taskId);

    inner.appendChild(container);

    attachEventListeners(taskId);
    loadData(taskId);
  }

  // 2. Embedded on Main Task Page (/tasks/:id)
  function injectTaskAnalyticsSection(taskId) {
    // Add "Analytics" button next to "Actions"
    const actionsBtn = document.querySelector('.cvat-task-page-actions-button') || document.querySelector('.cvat-actions-menu-button');
    if (actionsBtn && actionsBtn.parentElement && !document.getElementById('cvat-analytics-btn')) {
      const btn = document.createElement('button');
      btn.id = 'cvat-analytics-btn';
      btn.className = 'ant-btn ant-btn-default';
      btn.style.marginRight = '8px';
      btn.innerHTML = '<span>📊 Analytics</span>';
      btn.onclick = function () {
        const target = document.getElementById('cvat-task-analytics-card');
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        } else {
          window.location.href = `/tasks/${taskId}/analytics`;
        }
      };
      actionsBtn.parentElement.insertBefore(btn, actionsBtn);
    }

    // Embed Analytics card right before Jobs list on the task page
    if (document.getElementById('cvat-task-analytics-card')) return;
    const jobsList = document.querySelector('.cvat-task-jobs-list-wrapper') || document.querySelector('.cvat-job-list-component');
    const detailsWrapper = document.querySelector('.cvat-task-details-wrapper .ant-col');

    if (!detailsWrapper && !jobsList) return;

    const embedContainer = document.createElement('div');
    embedContainer.id = 'cvat-task-analytics-card';
    embedContainer.dataset.taskId = taskId;
    embedContainer.style.width = '100%';
    embedContainer.style.margin = '24px 0';

    embedContainer.innerHTML = getAnalyticsCardHTML(taskId);

    if (jobsList && jobsList.parentElement) {
      jobsList.parentElement.insertBefore(embedContainer, jobsList);
    } else if (detailsWrapper) {
      detailsWrapper.appendChild(embedContainer);
    }

    attachEventListeners(taskId);
    loadData(taskId);
  }

  function getAnalyticsCardHTML(taskId) {
    return `
      <div class="ant-card ant-card-bordered" style="border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); background: #fff; width: 100%;">
        <div class="ant-card-head" style="border-bottom: 1px solid #f0f0f0; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 16px; font-weight: 600; color: #262626;">
              📊 Annotation Analytics (Task #${taskId})
            </div>
            <div class="analytics-summary-text" style="margin-top: 4px; font-size: 13px; color: #8c8c8c;"></div>
          </div>
          <div>
            <button class="ant-btn ant-btn-default ant-btn-sm analytics-refresh-btn" style="border-radius: 4px;">
              🔄 Refresh
            </button>
          </div>
        </div>
        <div class="ant-card-body analytics-body" style="padding: 24px;">
          <div style="text-align: center; padding: 40px 0;">
            <div class="ant-spin ant-spin-spinning ant-spin-lg" style="margin-bottom: 12px;">
              <span class="ant-spin-dot ant-spin-dot-spin">
                <i class="ant-spin-dot-item"></i><i class="ant-spin-dot-item"></i>
                <i class="ant-spin-dot-item"></i><i class="ant-spin-dot-item"></i>
              </span>
            </div>
            <div style="color: #8c8c8c; font-size: 13px;">Loading annotation counts...</div>
          </div>
        </div>
      </div>
    `;
  }

  function attachEventListeners(taskId) {
    document.querySelectorAll('.analytics-refresh-btn').forEach(function (btn) {
      btn.onclick = function () {
        loadData(taskId);
      };
    });
  }

  function loadData(taskId) {
    const bodies = document.querySelectorAll('.analytics-body');
    const summaries = document.querySelectorAll('.analytics-summary-text');
    if (!bodies.length) return;

    bodies.forEach(function (body) {
      body.innerHTML = `
        <div style="text-align: center; padding: 36px 0;">
          <div style="color: #1890ff; font-size: 14px;">⏳ Querying /api/test/tasks/${taskId}/counts/...</div>
        </div>
      `;
    });

    fetch(`/api/test/tasks/${taskId}/counts/`)
      .then(function (res) {
        if (!res.ok) {
          return res.json().then(function (data) {
            throw new Error(data.detail || 'HTTP Error ' + res.status);
          }).catch(function (e) {
            throw new Error(e.message || 'HTTP Error ' + res.status);
          });
        }
        return res.json();
      })
      .then(function (data) {
        if (!data || data.length === 0) {
          summaries.forEach(function (s) { s.innerText = 'No annotations present on this task'; });
          bodies.forEach(function (body) {
            body.innerHTML = `
              <div style="text-align: center; padding: 40px 0;">
                <div style="font-size: 40px; margin-bottom: 8px;">📭</div>
                <div style="font-size: 16px; font-weight: 500; color: #595959;">No annotations found for this task</div>
                <div style="font-size: 13px; color: #8c8c8c; margin-top: 4px;">This task contains 0 annotations drawn or imported.</div>
                <button onclick="window.location.href='/tasks/${taskId}'" class="ant-btn ant-btn-primary" style="margin-top: 16px; border-radius: 4px;">
                  ← Back to Task #${taskId}
                </button>
              </div>
            `;
          });
          return;
        }

        const totalCount = data.reduce(function (sum, item) { return sum + item.count; }, 0);
        const maxCount = Math.max(...data.map(function (item) { return item.count; }), 1);

        summaries.forEach(function (s) {
          s.innerText = `Total: ${totalCount} annotations across ${data.length} classes`;
        });

        const colors = [
          '#1890ff', '#13c2c2', '#52c41a', '#faad14', '#f5222d',
          '#722ed1', '#eb2f96', '#fa8c16', '#2f54eb', '#a0d911',
          '#fa541c', '#096dd9'
        ];

        // 1. Generate Bar Chart HTML
        let barChartRows = data.map(function (item, idx) {
          const widthPct = Math.max((item.count / maxCount) * 100, 4);
          const color = colors[idx % colors.length];
          const pct = Math.round((item.count / totalCount) * 100);
          return `
            <div style="display: flex; align-items: center; margin-bottom: 10px;">
              <div style="width: 130px; text-align: right; padding-right: 14px; font-weight: 500; font-size: 13px; color: #262626; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${item.label}">
                ${item.label}
              </div>
              <div style="flex: 1; background: #f0f2f5; border-radius: 4px; height: 24px; position: relative; overflow: hidden;">
                <div style="width: ${widthPct}%; background: ${color}; height: 100%; border-radius: 4px; transition: width 0.4s ease-out; display: flex; align-items: center; justify-content: flex-end; padding-right: 8px;">
                  ${widthPct > 15 ? `<span style="color: #fff; font-size: 11px; font-weight: 600;">${pct}%</span>` : ''}
                </div>
              </div>
              <div style="width: 50px; padding-left: 10px; font-weight: 700; font-size: 13px; color: ${color};">
                ${item.count}
              </div>
            </div>
          `;
        }).join('');

        const contentHTML = `
          <!-- Bar Chart Section (Item 3) -->
          <div style="background: #fafafa; border: 1px solid #f0f0f0; border-radius: 6px; padding: 18px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
              <div style="font-size: 14px; font-weight: 600; color: #262626;">📊 Annotation Distribution (Bar Chart)</div>
              <span style="font-size: 12px; color: #8c8c8c;">Highest count: ${maxCount}</span>
            </div>
            <div style="display: flex; flex-direction: column;">
              ${barChartRows}
            </div>
          </div>
        `;

        bodies.forEach(function (body) {
          body.innerHTML = contentHTML;
        });
      })
      .catch(function (err) {
        summaries.forEach(function (s) { s.innerText = ''; });
        const errorHTML = `
          <div style="background: #fff2f0; border: 1px solid #ffccc7; border-radius: 6px; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600; color: #cf1322; margin-bottom: 2px;">❌ Failed to load annotation counts</div>
              <div style="color: #434343; font-size: 13px;">${err.message}</div>
            </div>
            <button class="ant-btn ant-btn-primary ant-btn-dangerous ant-btn-sm analytics-retry-btn" style="border-radius: 4px;">
              Retry
            </button>
          </div>
        `;
        bodies.forEach(function (body) {
          body.innerHTML = errorHTML;
        });
        document.querySelectorAll('.analytics-retry-btn').forEach(function (btn) {
          btn.onclick = function () {
            loadData(taskId);
          };
        });
      });
  }

  // Poll route changes
  setInterval(injectAnalytics, 600);
  window.addEventListener('popstate', injectAnalytics);
  window.addEventListener('load', injectAnalytics);
})();

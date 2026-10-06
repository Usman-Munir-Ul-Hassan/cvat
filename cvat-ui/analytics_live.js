// CVAT Annotation Analytics Client Script (Items 2-4)
(function () {
  console.log('[Analytics] Live analytics module initialized.');

  function injectAnalytics() {
    const path = window.location.pathname;
    const analyticsMatch = path.match(/\/tasks\/(\d+)\/analytics/);

    if (analyticsMatch) {
      const taskId = analyticsMatch[1];
      renderAnalyticsPage(taskId);
      return;
    }

    const taskMatch = path.match(/\/tasks\/(\d+)$/);
    if (taskMatch) {
      const taskId = taskMatch[1];
      injectTaskButton(taskId);
    }
  }

  function injectTaskButton(taskId) {
    if (document.getElementById('cvat-analytics-btn')) return;
    const actionsBtn = document.querySelector('.cvat-task-page-actions-button') || document.querySelector('.cvat-actions-menu-button');
    if (actionsBtn && actionsBtn.parentElement) {
      const btn = document.createElement('button');
      btn.id = 'cvat-analytics-btn';
      btn.className = 'ant-btn ant-btn-default';
      btn.style.marginRight = '8px';
      btn.innerHTML = '<span>📊 Analytics</span>';
      btn.onclick = function () {
        window.location.href = `/tasks/${taskId}/analytics`;
      };
      actionsBtn.parentElement.insertBefore(btn, actionsBtn);
    }
  }

  function renderAnalyticsPage(taskId) {
    const existing = document.getElementById('cvat-analytics-container');
    if (existing && existing.dataset.taskId === taskId) return;

    // Check if the placeholder or analytics wrapper is ready
    let target = document.querySelector('.cvat-analytics-inner') || 
                 document.querySelector('.cvat-analytics-inner-wrapper') || 
                 document.querySelector('.cvat-analytics-page') ||
                 document.getElementById('root');

    if (!target) return;

    if (existing) existing.remove();

    const container = document.createElement('div');
    container.id = 'cvat-analytics-container';
    container.dataset.taskId = taskId;
    container.style.padding = '24px';
    container.style.maxWidth = '1100px';
    container.style.margin = '0 auto';
    container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial';

    // Hide any existing paid placeholder
    const placeholder = document.querySelector('.cvat-paid-feature-placeholder');
    if (placeholder) placeholder.style.display = 'none';

    container.innerHTML = `
      <div style="margin-bottom: 16px;">
        <button id="cvat-back-btn" class="ant-btn ant-btn-link" style="padding-left: 0; font-size: 14px;">
          ← Back to Task #${taskId}
        </button>
      </div>
      <div class="ant-card ant-card-bordered" style="border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.06); background: #fff;">
        <div class="ant-card-head" style="border-bottom: 1px solid #f0f0f0; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h2 style="margin: 0; font-size: 18px; font-weight: 600; color: #1f1f1f;">
              📊 Annotation Analytics (Task #${taskId})
            </h2>
            <div id="analytics-summary" style="margin-top: 4px; font-size: 13px; color: #8c8c8c;"></div>
          </div>
          <div>
            <button id="analytics-refresh-btn" class="ant-btn ant-btn-default ant-btn-sm" style="border-radius: 4px;">
              🔄 Refresh
            </button>
          </div>
        </div>
        <div class="ant-card-body" id="analytics-body" style="padding: 24px;">
          <div style="text-align: center; padding: 48px 0;">
            <div class="ant-spin ant-spin-spinning ant-spin-lg" style="margin-bottom: 12px;">
              <span class="ant-spin-dot ant-spin-dot-spin">
                <i class="ant-spin-dot-item"></i><i class="ant-spin-dot-item"></i>
                <i class="ant-spin-dot-item"></i><i class="ant-spin-dot-item"></i>
              </span>
            </div>
            <div style="color: #8c8c8c;">Loading annotation counts...</div>
          </div>
        </div>
      </div>
    `;

    // Insert container
    if (document.querySelector('.cvat-analytics-inner')) {
      const inner = document.querySelector('.cvat-analytics-inner');
      inner.prepend(container);
    } else {
      target.appendChild(container);
    }

    document.getElementById('cvat-back-btn').onclick = function () {
      window.location.href = `/tasks/${taskId}`;
    };

    document.getElementById('analytics-refresh-btn').onclick = function () {
      loadData(taskId);
    };

    loadData(taskId);
  }

  function loadData(taskId) {
    const body = document.getElementById('analytics-body');
    const summary = document.getElementById('analytics-summary');
    if (!body) return;

    body.innerHTML = `
      <div style="text-align: center; padding: 48px 0;">
        <div style="color: #1890ff; font-size: 16px;">⏳ Fetching per-class counts from API...</div>
      </div>
    `;

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
          if (summary) summary.innerText = 'No annotations present on this task';
          body.innerHTML = `
            <div style="text-align: center; padding: 48px 0;">
              <div style="font-size: 40px; margin-bottom: 12px;">📭</div>
              <div style="font-size: 16px; font-weight: 500; color: #595959;">No annotations found for this task</div>
              <div style="font-size: 13px; color: #8c8c8c; margin-top: 6px;">Draw shapes on the task images or import a dataset to see analytics.</div>
            </div>
          `;
          return;
        }

        const totalCount = data.reduce(function (sum, item) { return sum + item.count; }, 0);
        if (summary) {
          summary.innerText = `Total: ${totalCount} annotations across ${data.length} classes`;
        }

        let tableRows = data.map(function (item, idx) {
          const pct = Math.round((item.count / totalCount) * 100);
          return `
            <tr style="border-bottom: 1px solid #f0f0f0;">
              <td style="padding: 12px 16px; font-weight: 500;">${item.label}</td>
              <td style="padding: 12px 16px; text-align: right; font-weight: 600; color: #1890ff;">${item.count}</td>
              <td style="padding: 12px 16px; text-align: right; color: #8c8c8c;">${pct}%</td>
            </tr>
          `;
        }).join('');

        body.innerHTML = `
          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="background: #fafafa; border-bottom: 1px solid #f0f0f0;">
                  <th style="padding: 12px 16px; color: #595959; font-weight: 600;">Class Label</th>
                  <th style="padding: 12px 16px; text-align: right; color: #595959; font-weight: 600;">Count</th>
                  <th style="padding: 12px 16px; text-align: right; color: #595959; font-weight: 600;">Share (%)</th>
                </tr>
              </thead>
              <tbody>
                ${tableRows}
              </tbody>
            </table>
          </div>
        `;
      })
      .catch(function (err) {
        if (summary) summary.innerText = '';
        body.innerHTML = `
          <div style="background: #fff2f0; border: 1px solid #ffccc7; border-radius: 6px; padding: 16px 24px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <div style="font-weight: 600; color: #cf1322; margin-bottom: 4px;">❌ Failed to load annotation counts</div>
              <div style="color: #434343; font-size: 13px;">${err.message}</div>
            </div>
            <button id="analytics-retry-btn" class="ant-btn ant-btn-primary ant-btn-dangerous ant-btn-sm" style="border-radius: 4px;">
              Retry
            </button>
          </div>
        `;
        const retryBtn = document.getElementById('analytics-retry-btn');
        if (retryBtn) {
          retryBtn.onclick = function () {
            loadData(taskId);
          };
        }
      });
  }

  // Poll route changes
  setInterval(injectAnalytics, 600);
  window.addEventListener('popstate', injectAnalytics);
  window.addEventListener('load', injectAnalytics);
})();

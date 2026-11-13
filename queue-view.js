// The server controls admission. The timer only displays its last estimate.
export function createQueueView(dialog, onCancel) {
  const section = dialog.querySelector('#gate-queue');
  const form = dialog.querySelector('#guest-form');
  const close = dialog.querySelector('.entrance-close');
  const title = section.querySelector('#queue-title');
  const name = section.querySelector('#queue-name');
  const occupancy = section.querySelector('#queue-occupancy');
  const ahead = section.querySelector('#queue-ahead');
  const eta = section.querySelector('#queue-eta');
  const units = section.querySelector('#queue-units');
  const notice = section.querySelector('#queue-notice');
  section.querySelector('#queue-cancel').onclick = onCancel;

  let state, deadline, previousEstimate, timer;
  function render() {
    if (!state) return;
    const seconds = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
    const clock = seconds >= 3600
      ? Math.floor(seconds / 3600) + '时' + Math.floor(seconds % 3600 / 60) + '分'
      : Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
    const hasTime = !state.offline && Number.isFinite(seconds) && seconds > 0;
    units.hidden = !hasTime || seconds >= 3600;
    eta.classList.toggle('queue-eta-text', !hasTime);
    eta.textContent = hasTime ? clock : state.offline ? '重连中' : '估算中';
    if (hasTime) {
      eta.setAttribute('datetime', 'PT' + seconds + 'S');
      eta.setAttribute('aria-label', '约 ' + Math.floor(seconds / 60) + ' 分 ' + seconds % 60 + ' 秒');
    } else {
      eta.removeAttribute('datetime');
      eta.removeAttribute('aria-label');
    }
    let detail;
    if (state.offline) detail = '正在重新连接展馆，恢复后将更新排队进度。';
    else if (!hasTime) detail = '仍在等候空位，入馆时间将随馆内情况更新。';
    else detail = state.estimatingFromHistory ? '时间根据近期访客的参观时长估算。' : '当前为初步估算，时间会随访客离馆而更新。';
    const message = state.offline ? detail : (state.ahead === 0 ? '下一位就是你。' : '') + detail;
    if (notice.textContent !== message) notice.textContent = message;
  }

  function update(profile, next) {
    const first = section.hidden;
    const estimate = next.etaSeconds;
    // Identical polls while nobody leaves must not rewind the clock.
    if (first || next.offline || state?.offline || next.ahead !== state?.ahead || previousEstimate !== estimate) {
      deadline = Number.isFinite(estimate) ? Date.now() + estimate * 1000 : NaN;
      previousEstimate = estimate;
    }
    state = next;
    name.textContent = profile.name;
    occupancy.textContent = Number.isInteger(next.occupancy) ? next.occupancy + ' / ' + next.capacity : '—';
    const aheadText = Number.isInteger(next.ahead) ? String(next.ahead) : '—';
    if (ahead.textContent !== aheadText) ahead.textContent = aheadText;
    if (first) {
      form.hidden = true;
      close.hidden = true;
      section.hidden = false;
      dialog.setAttribute('aria-labelledby', title.id);
      if (!dialog.open) dialog.showModal();
      title.focus({preventScroll: true});
      timer = setInterval(render, 1000);
    }
    render();
  }
  function hide() {
    clearInterval(timer);
    state = undefined;
    previousEstimate = undefined;
    form.hidden = false;
    close.hidden = false;
    section.hidden = true;
    dialog.setAttribute('aria-labelledby', 'gate-title');
  }
  return {update, hide};
}

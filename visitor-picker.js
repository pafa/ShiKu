export function makeVisitorPicker({el, action, modal, visitors, selectedVisitor, changeVisitor, startVisit, canChangeVisitor, initialVisitor}) {
  let pending = null;
  let error = '';
  let refresh = () => {};

  async function choose(visitor) {
    if (pending?.id === visitor.id) return;
    const request = {id: visitor.id};
    pending = request;
    error = '';
    refresh();
    let loaded;
    try {
      loaded = await changeVisitor(visitor.id);
    } catch {
      loaded = false;
    }
    if (pending !== request) return;
    pending = null;
    if (!loaded) error = visitor.label + '载入失败，点选可重试。';
    refresh();
  }

  function open() {
    modal('我的访客', 'person', body => {
      const grid = el('div', 'visitors');
      grid.setAttribute('role', 'group');
      grid.setAttribute('aria-label', '选择访客形象');
      const buttons = visitors.map(visitor => {
        const button = action('', () => choose(visitor), 'person-card');
        button.dataset.visitor = visitor.id;
        const portrait = el('img');
        portrait.alt = '';
        portrait.src = visitor.portrait;
        portrait.draggable = false;
        const mark = el('span', 'visitor-mark', '✓');
        mark.setAttribute('aria-hidden', 'true');
        button.append(portrait, mark, el('strong', '', visitor.label), el('small', '', visitor.description));
        grid.append(button);
        return button;
      });

      // Keep the arrow keys inside the portrait grid while the gallery is paused.
      grid.addEventListener('keydown', event => {
        const index = buttons.indexOf(event.target);
        if (index < 0 || event.altKey || event.metaKey || event.ctrlKey) return;
        const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').length;
        const next = {
          ArrowLeft: index - 1, ArrowRight: index + 1, ArrowUp: index - columns,
          ArrowDown: index + columns, Home: 0, End: buttons.length - 1
        }[event.key];
        if (next === undefined) return;
        event.preventDefault();
        buttons[Math.max(0, Math.min(next, buttons.length - 1))].focus();
      });

      const controls = el('div', 'visitor-controls');
      const status = el('p', 'visitor-status');
      status.setAttribute('role', 'status');
      status.setAttribute('aria-atomic', 'true');
      const firstPerson = action('人眼视角', () => startVisit(true), 'visitor-eyes');
      const follow = action('随人物逛馆 →', () => startVisit(false), 'visitor-enter');
      controls.append(status, firstPerson, follow);
      body.append(grid, controls);

      refresh = () => {
        if (!grid.isConnected) return;
        const available = canChangeVisitor();
        const selected = selectedVisitor();
        for (const button of buttons) {
          const id = button.dataset.visitor;
          button.disabled = !available;
          button.setAttribute('aria-pressed', String(id === selected));
          button.setAttribute('aria-busy', String(id === pending?.id));
        }
        const current = visitors.find(person => person.id === selected);
        const loadingId = pending?.id ?? (!current ? initialVisitor() : null);
        const loading = visitors.find(person => person.id === loadingId);
        if (!available) status.textContent = initialVisitor() ? '正在打开三维展馆…' : '此设备无法显示三维访客，可关闭窗口继续看展。';
        else if (error) status.textContent = error;
        else if (loading) status.textContent = '正在载入' + loading.label + '…';
        else if (current) status.textContent = '当前形象 · ' + current.label;
        else status.textContent = '访客形象未能载入，点选可重试。';
        firstPerson.disabled = !available || !!pending;
        follow.disabled = firstPerson.disabled || !current;
      };
      refresh();
    });
  }
  return {open, refresh: () => refresh()};
}

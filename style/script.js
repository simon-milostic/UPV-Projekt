/*
(function () {
	'use strict';

	const q = (sel, root = document) => root.querySelector(sel);
	const qa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

	function createTooltip() {
		const tip = document.createElement('div');
		tip.className = 'js-tooltip';
		Object.assign(tip.style, {
			position: 'fixed',
			pointerEvents: 'none',
			background: '#244c3c',
			color: '#fff',
			padding: '6px 8px',
			borderRadius: '6px',
			fontSize: '13px',
			zIndex: 9999,
			transform: 'translate(-50%, -120%)',
			whiteSpace: 'nowrap',
			display: 'none'
		});
		document.body.appendChild(tip);
		return tip;
	}

	function initChartTooltips() {
		const tooltip = createTooltip();
		qa('.chart .point').forEach((point) => {
			const title = point.querySelector('title')?.textContent || point.getAttribute('data-title') || '';
			point.setAttribute('tabindex', '0');

			function show(e) {
				tooltip.textContent = title;
				tooltip.style.display = 'block';
				move(e);
			}

			function move(e) {
				const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
				const y = e.clientY || (e.touches && e.touches[0].clientY) || 0;
				tooltip.style.left = x + 'px';
				tooltip.style.top = y + 'px';
			}

			function hide() {
				tooltip.style.display = 'none';
			}

			point.addEventListener('mouseenter', show);
			point.addEventListener('mousemove', move);
			point.addEventListener('mouseleave', hide);

			point.addEventListener('focus', show);
			point.addEventListener('blur', hide);
			point.addEventListener('keydown', (ev) => {
				if (ev.key === 'Enter' || ev.key === ' ') {
					ev.preventDefault();
					// briefly show tooltip
					show(ev);
					setTimeout(hide, 2000);
				}
			});
		});
	}

	function initLegendHighlight() {
		const legends = qa('.legend span');
		const polylines = qa('.chart .line');
		if (!legends.length || !polylines.length) return;

		legends.forEach((item, i) => {
			const poly = polylines[i];
			if (!poly) return;
			item.style.cursor = 'pointer';

			item.addEventListener('mouseenter', () => {
				poly.style.strokeWidth = (parseFloat(getComputedStyle(poly).strokeWidth) || 4) * 2 + 'px';
				poly.style.opacity = '1';
			});
			item.addEventListener('mouseleave', () => {
				poly.style.strokeWidth = '';
				poly.style.opacity = '';
			});
			item.addEventListener('click', () => {
				const active = item.classList.toggle('js-legend-active');
				if (active) {
					polylines.forEach(p => p.style.opacity = '0.2');
					poly.style.opacity = '1';
					poly.style.strokeWidth = '4.5px';
				} else {
					polylines.forEach(p => { p.style.opacity = ''; p.style.strokeWidth = ''; });
				}
			});
		});
	}

	// animate polylines/areas when chart enters viewport or on load
	function animateCharts() {
		qa('.chart').forEach(svg => {
			// add marker class so CSS transitions apply
			svg.classList.add('js-animate');
			// play lines and areas with slight staggering
			const lines = qa('.line', svg);
			const areas = qa('.area', svg);
			lines.forEach((line, idx) => {
				// ensure CSS transition will run
				setTimeout(() => line.classList.add('play'), idx * 120);
			});
			areas.forEach((area, idx) => setTimeout(() => area.classList.add('play'), 200 + idx * 120));
		});
	}

	function resetChartAnimations() {
		qa('.chart').forEach(svg => {
			qa('.line, .area', svg).forEach(el => {
				el.classList.remove('play');
			});
			svg.classList.remove('js-animate');
		});
	}

	function initSVGAnimations() {
		// animate on load
		requestAnimationFrame(() => setTimeout(animateCharts, 120));

		// replay when charts scroll into view
		if ('IntersectionObserver' in window) {
			const io = new IntersectionObserver((entries) => {
				entries.forEach(e => {
					if (e.isIntersecting) animateCharts();
				});
			}, {threshold: 0.3});
			qa('.chart').forEach(svg => io.observe(svg));
		}
	}


	   
	function initCustomSelects() {
		qa('form.filters select').forEach(select => {
			if (select.dataset.customized) return; // already processed
			select.dataset.customized = '1';

			const wrapper = document.createElement('div');
			wrapper.className = 'custom-select';

			const trigger = document.createElement('button');
			trigger.type = 'button';
			trigger.className = 'custom-select__trigger';
			trigger.setAttribute('aria-haspopup', 'listbox');
			trigger.setAttribute('aria-expanded', 'false');

			const panel = document.createElement('div');
			panel.className = 'custom-select__panel';
			panel.setAttribute('role', 'listbox');
			panel.tabIndex = -1;

			function build() {
				panel.innerHTML = '';
				Array.from(select.options).forEach((opt, i) => {
					const item = document.createElement('div');
					item.className = 'custom-select__option';
					item.setAttribute('role', 'option');
					item.dataset.value = opt.value;
					item.tabIndex = 0;
					item.textContent = opt.textContent;
					if (opt.selected) item.setAttribute('aria-selected', 'true');
					item.addEventListener('click', (ev) => { ev.stopPropagation(); ev.preventDefault(); selectOption(item); });
					item.addEventListener('pointerdown', (ev) => { ev.preventDefault(); });
					item.addEventListener('keydown', (ev) => {
						if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); selectOption(item); }
						if (ev.key === 'ArrowDown') { ev.preventDefault(); focusNext(item); }
						if (ev.key === 'ArrowUp') { ev.preventDefault(); focusPrev(item); }
					});
					panel.appendChild(item);
				});
				updateTrigger();
			}

			function updateTrigger() {
				const sel = select.options[select.selectedIndex];
				trigger.textContent = sel ? sel.textContent : '';
			}

			function selectOption(item) {
				const val = item.dataset.value;
				select.value = val;
				// update native options selection
				Array.from(select.options).forEach(o => o.selected = o.value === val);
				panel.querySelectorAll('.custom-select__option').forEach(n => n.removeAttribute('aria-selected'));
				item.setAttribute('aria-selected', 'true');
				updateTrigger();
				// Immediately hide the panel (also set inline style to avoid flicker)
				panel.classList.remove('show');
				panel.style.display = 'none';
				trigger.setAttribute('aria-expanded', 'false');
				// move focus back to trigger next tick to avoid interfering with click handling
				setTimeout(() => trigger.focus(), 0);
				select.dispatchEvent(new Event('change', { bubbles: true }));
			}

			function focusNext(current) {
				const items = Array.from(panel.querySelectorAll('.custom-select__option'));
				const i = items.indexOf(current);
				if (i < items.length - 1) items[i + 1].focus();
			}

			function focusPrev(current) {
				const items = Array.from(panel.querySelectorAll('.custom-select__option'));
				const i = items.indexOf(current);
				if (i > 0) items[i - 1].focus();
			}

			function openPanel() {
				// close other open panels first
				document.querySelectorAll('.custom-select__panel.show').forEach(p => {
					if (p !== panel) { p.classList.remove('show'); p.style.display = 'none'; }
				});
				panel.classList.add('show');
				panel.style.display = 'block';
				trigger.setAttribute('aria-expanded', 'true');
				// focus the selected option
				const sel = panel.querySelector('[aria-selected="true"]');
				if (sel) sel.focus();
			}

			function closePanel() {
				panel.classList.remove('show');
				panel.style.display = 'none';
				trigger.setAttribute('aria-expanded', 'false');
				trigger.focus();
			}

			trigger.addEventListener('click', (e) => {
				e.preventDefault();
				if (panel.classList.contains('show')) closePanel();
				else openPanel();
			});

			// close on outside click
			document.addEventListener('click', (e) => {
				if (!wrapper.contains(e.target)) closePanel();
			});

			// keyboard on trigger
			trigger.addEventListener('keydown', (ev) => {
				if (ev.key === 'ArrowDown') { ev.preventDefault(); openPanel(); }
				if (ev.key === 'Escape') { closePanel(); }
			});

			// keep the native select for forms but hide it visually
			select.style.display = 'none';
			select.setAttribute('aria-hidden', 'true');

			wrapper.appendChild(trigger);
			wrapper.appendChild(panel);
			select.parentNode.insertBefore(wrapper, select);
			wrapper.appendChild(select);

			build();
		});
	}

	function initCardTilt() {
		const cards = qa('.market-card, .summary article');
		if (!cards.length) return;

		cards.forEach(card => {
			let rect = null;
			function updateRect() { rect = card.getBoundingClientRect(); }
			updateRect();
			window.addEventListener('resize', updateRect);

			card.addEventListener('mousemove', (e) => {
				if (!rect) updateRect();
				const cx = rect.left + rect.width / 2;
				const cy = rect.top + rect.height / 2;
				const dx = (e.clientX - cx) / (rect.width / 2);
				const dy = (e.clientY - cy) / (rect.height / 2);
				const max = 6; // degrees
				const rx = -dy * max;
				const ry = dx * max;
				card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
				card.classList.add('js-tilt-active');
			});

			card.addEventListener('mouseleave', () => {
				card.style.transform = '';
				card.classList.remove('js-tilt-active');
			});
		});
	}

	function initPageReveals() {
		const nodes = qa('.cool, .page h1, .chart-heading h2, .market-card, .summary article');
		if (!nodes.length) return;
		nodes.forEach(n => n.classList.add('reveal-init'));
		requestAnimationFrame(() => setTimeout(() => {
			nodes.forEach((n, i) => setTimeout(() => n.classList.add('reveal'), i * 70));
		}, 80));
	}

	function initFilterPersistence() {
		const forms = qa('form.filters');
		if (!forms.length || !window.localStorage) return;

		forms.forEach((form) => {
			const key = 'filters:' + (location.pathname || '/');

			// restore if no querystring present (server already honored GET params)
			if (!location.search) {
				try {
					const saved = JSON.parse(localStorage.getItem(key) || '{}');
					Object.keys(saved).forEach(name => {
						const el = form.elements[name];
						if (!el) return;
						if (el.length && el[0].type === 'checkbox') {
							// checkboxes collection
							qa(`input[name="${name}"]`, form).forEach(inp => { inp.checked = saved[name].includes(inp.value); });
						} else {
							el.value = saved[name];
						}
					});
				} catch (e) {
					// ignore
				}
			}

			function save() {
				const data = {};
				Array.from(form.elements).forEach((el) => {
					if (!el.name) return;
					if (el.type === 'checkbox') {
						data[el.name] = qa(`input[name="${el.name}"]`, form).filter(i => i.checked).map(i => i.value);
					} else if (el.tagName === 'SELECT' || el.type === 'text' || el.type === 'search') {
						data[el.name] = el.value;
					}
				});
				localStorage.setItem(key, JSON.stringify(data));
			}

			form.addEventListener('change', save);
			form.addEventListener('submit', save);
		});
	}

	function initKeyboardShortcuts() {
		document.addEventListener('keydown', (ev) => {
			if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA' || ev.target.isContentEditable)) return;
			if (ev.key === 'f') {
				const sel = q('form.filters select');
				if (sel) sel.focus();
			}
			if (ev.key === 'r') {
				// try to submit a refresh button in the first filters form
				const form = q('form.filters');
				if (form) {
					const refresh = q('button[name="refresh"][value="1"]', form) || q('button.secondary', form);
					if (refresh) refresh.click();
					else form.requestSubmit?.();
				}
			}
		});
	}

	function init() {
		initChartTooltips();
		initLegendHighlight();
		initFilterPersistence();
		initKeyboardShortcuts();
		initSVGAnimations();
		initCustomSelects();
		initCardTilt();
		initPageReveals();
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
	else init();

})();

(function () {
	'use strict';

	const q = (sel, root = document) => root.querySelector(sel);
	const qa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

	function createTooltip() {
		const tip = document.createElement('div');
		tip.className = 'js-tooltip';
		Object.assign(tip.style, {
			position: 'fixed',
			pointerEvents: 'none',
			background: '#244c3c',
			color: '#fff',
			padding: '6px 8px',
			borderRadius: '6px',
			fontSize: '13px',
			zIndex: 9999,
			transform: 'translate(-50%, -120%)',
			whiteSpace: 'nowrap',
			display: 'none'
		});
		document.body.appendChild(tip);
		return tip;
	}

	function initChartTooltips() {
		const tooltip = createTooltip();
		qa('.chart .point').forEach((point) => {
			const title = point.querySelector('title')?.textContent || point.getAttribute('data-title') || '';
			point.setAttribute('tabindex', '0');

			function show(e) {
				tooltip.textContent = title;
				tooltip.style.display = 'block';
				move(e);
			}

			function move(e) {
				const x = e.clientX || (e.touches && e.touches[0].clientX) || 0;
				const y = e.clientY || (e.touches && e.touches[0].clientY) || 0;
				tooltip.style.left = x + 'px';
				tooltip.style.top = y + 'px';
			}

			function hide() {
				tooltip.style.display = 'none';
			}

			point.addEventListener('mouseenter', show);
			point.addEventListener('mousemove', move);
			point.addEventListener('mouseleave', hide);

			point.addEventListener('focus', show);
			point.addEventListener('blur', hide);
			point.addEventListener('keydown', (ev) => {
				if (ev.key === 'Enter' || ev.key === ' ') {
					ev.preventDefault();
					// briefly show tooltip
					show(ev);
					setTimeout(hide, 2000);
				}
			});
		});
	}

	function initLegendHighlight() {
		const legends = qa('.legend span');
		const polylines = qa('.chart .line');
		if (!legends.length || !polylines.length) return;

		legends.forEach((item, i) => {
			const poly = polylines[i];
			if (!poly) return;
			item.style.cursor = 'pointer';

			item.addEventListener('mouseenter', () => {
				poly.style.strokeWidth = (parseFloat(getComputedStyle(poly).strokeWidth) || 4) * 2 + 'px';
				poly.style.opacity = '1';
			});
			item.addEventListener('mouseleave', () => {
				poly.style.strokeWidth = '';
				poly.style.opacity = '';
			});
			item.addEventListener('click', () => {
				const active = item.classList.toggle('js-legend-active');
				if (active) {
					polylines.forEach(p => p.style.opacity = '0.2');
					poly.style.opacity = '1';
					poly.style.strokeWidth = '4.5px';
				} else {
					polylines.forEach(p => { p.style.opacity = ''; p.style.strokeWidth = ''; });
				}
			});
		});
	}

	// animate polylines/areas when chart enters viewport or on load
	function animateCharts() {
		qa('.chart').forEach(svg => {
			// add marker class so CSS transitions apply
			svg.classList.add('js-animate');
			// play lines and areas with slight staggering
			const lines = qa('.line', svg);
			const areas = qa('.area', svg);
			lines.forEach((line, idx) => {
				// ensure CSS transition will run
				setTimeout(() => line.classList.add('play'), idx * 120);
			});
			areas.forEach((area, idx) => setTimeout(() => area.classList.add('play'), 200 + idx * 120));
		});
	}

	function resetChartAnimations() {
		qa('.chart').forEach(svg => {
			qa('.line, .area', svg).forEach(el => {
				el.classList.remove('play');
			});
			svg.classList.remove('js-animate');
		});
	}

	function initSVGAnimations() {
		// animate on load
		requestAnimationFrame(() => setTimeout(animateCharts, 120));

		// replay when charts scroll into view
		if ('IntersectionObserver' in window) {
			const io = new IntersectionObserver((entries) => {
				entries.forEach(e => {
					if (e.isIntersecting) animateCharts();
				});
			}, {threshold: 0.3});
			qa('.chart').forEach(svg => io.observe(svg));
		}
	}

	
	function initCustomSelects() {
		qa('form.filters select').forEach(select => {
			if (select.dataset.customized) return; // already processed
			select.dataset.customized = '1';

			const wrapper = document.createElement('div');
			wrapper.className = 'custom-select';

			const trigger = document.createElement('button');
			trigger.type = 'button';
			trigger.className = 'custom-select__trigger';
			trigger.setAttribute('aria-haspopup', 'listbox');
			trigger.setAttribute('aria-expanded', 'false');

			const panel = document.createElement('div');
			panel.className = 'custom-select__panel';
			panel.setAttribute('role', 'listbox');
			panel.tabIndex = -1;

			function build() {
				panel.innerHTML = '';
				Array.from(select.options).forEach((opt, i) => {
					const item = document.createElement('div');
					item.className = 'custom-select__option';
					item.setAttribute('role', 'option');
					item.dataset.value = opt.value;
					item.tabIndex = 0;
					item.textContent = opt.textContent;
					if (opt.selected) item.setAttribute('aria-selected', 'true');
					item.addEventListener('click', (ev) => { ev.stopPropagation(); ev.preventDefault(); selectOption(item); });
					item.addEventListener('pointerdown', (ev) => { ev.preventDefault(); });
					item.addEventListener('keydown', (ev) => {
						if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); selectOption(item); }
						if (ev.key === 'ArrowDown') { ev.preventDefault(); focusNext(item); }
						if (ev.key === 'ArrowUp') { ev.preventDefault(); focusPrev(item); }
					});
					panel.appendChild(item);
				});
				updateTrigger();
			}

			function updateTrigger() {
				const sel = select.options[select.selectedIndex];
				trigger.textContent = sel ? sel.textContent : '';
			}

			function selectOption(item) {
				const val = item.dataset.value;
				select.value = val;
				// update native options selection
				Array.from(select.options).forEach(o => o.selected = o.value === val);
				panel.querySelectorAll('.custom-select__option').forEach(n => n.removeAttribute('aria-selected'));
				item.setAttribute('aria-selected', 'true');
				updateTrigger();
				// Immediately hide the panel (also set inline style to avoid flicker)
				panel.classList.remove('show');
				panel.style.display = 'none';
				trigger.setAttribute('aria-expanded', 'false');
				// move focus back to trigger next tick to avoid interfering with click handling
				setTimeout(() => trigger.focus(), 0);
				select.dispatchEvent(new Event('change', { bubbles: true }));
			}

			function focusNext(current) {
				const items = Array.from(panel.querySelectorAll('.custom-select__option'));
				const i = items.indexOf(current);
				if (i < items.length - 1) items[i + 1].focus();
			}

			function focusPrev(current) {
				const items = Array.from(panel.querySelectorAll('.custom-select__option'));
				const i = items.indexOf(current);
				if (i > 0) items[i - 1].focus();
			}

			function openPanel() {
				// close other open panels first
				document.querySelectorAll('.custom-select__panel.show').forEach(p => {
					if (p !== panel) { p.classList.remove('show'); p.style.display = 'none'; }
				});
				panel.classList.add('show');
				panel.style.display = 'block';
				trigger.setAttribute('aria-expanded', 'true');
				// focus the selected option
				const sel = panel.querySelector('[aria-selected="true"]');
				if (sel) sel.focus();
			}

			function closePanel() {
				panel.classList.remove('show');
				panel.style.display = 'none';
				trigger.setAttribute('aria-expanded', 'false');
				trigger.focus();
			}

			trigger.addEventListener('click', (e) => {
				e.preventDefault();
				if (panel.classList.contains('show')) closePanel();
				else openPanel();
			});

			// close on outside click
			document.addEventListener('click', (e) => {
				if (!wrapper.contains(e.target)) closePanel();
			});

			// keyboard on trigger
			trigger.addEventListener('keydown', (ev) => {
				if (ev.key === 'ArrowDown') { ev.preventDefault(); openPanel(); }
				if (ev.key === 'Escape') { closePanel(); }
			});

			// keep the native select for forms but hide it visually
			select.style.display = 'none';
			select.setAttribute('aria-hidden', 'true');

			wrapper.appendChild(trigger);
			wrapper.appendChild(panel);
			select.parentNode.insertBefore(wrapper, select);
			wrapper.appendChild(select);

			build();
		});
	}

	function initCardTilt() {
		const cards = qa('.market-card, .summary article');
		if (!cards.length) return;

		cards.forEach(card => {
			let rect = null;
			function updateRect() { rect = card.getBoundingClientRect(); }
			updateRect();
			window.addEventListener('resize', updateRect);

			card.addEventListener('mousemove', (e) => {
				if (!rect) updateRect();
				const cx = rect.left + rect.width / 2;
				const cy = rect.top + rect.height / 2;
				const dx = (e.clientX - cx) / (rect.width / 2);
				const dy = (e.clientY - cy) / (rect.height / 2);
				const max = 6; // degrees
				const rx = -dy * max;
				const ry = dx * max;
				card.style.transform = `perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
				card.classList.add('js-tilt-active');
			});

			card.addEventListener('mouseleave', () => {
				card.style.transform = '';
				card.classList.remove('js-tilt-active');
			});
		});
	}

	function initPageReveals() {
		const nodes = qa('.cool, .page h1, .chart-heading h2, .market-card, .summary article');
		if (!nodes.length) return;
		nodes.forEach(n => n.classList.add('reveal-init'));
		requestAnimationFrame(() => setTimeout(() => {
			nodes.forEach((n, i) => setTimeout(() => n.classList.add('reveal'), i * 70));
		}, 80));
	}

	function initFilterPersistence() {
		const forms = qa('form.filters');
		if (!forms.length || !window.localStorage) return;

		forms.forEach((form) => {
			const key = 'filters:' + (location.pathname || '/');

			// restore if no querystring present (server already honored GET params)
			if (!location.search) {
				try {
					const saved = JSON.parse(localStorage.getItem(key) || '{}');
					Object.keys(saved).forEach(name => {
						const el = form.elements[name];
						if (!el) return;
						if (el.length && el[0].type === 'checkbox') {
							// checkboxes collection
							qa(`input[name="${name}"]`, form).forEach(inp => { inp.checked = saved[name].includes(inp.value); });
						} else {
							el.value = saved[name];
						}
					});
				} catch (e) {
					// ignore
				}
			}

			function save() {
				const data = {};
				Array.from(form.elements).forEach((el) => {
					if (!el.name) return;
					if (el.type === 'checkbox') {
						data[el.name] = qa(`input[name="${el.name}"]`, form).filter(i => i.checked).map(i => i.value);
					} else if (el.tagName === 'SELECT' || el.type === 'text' || el.type === 'search') {
						data[el.name] = el.value;
					}
				});
				localStorage.setItem(key, JSON.stringify(data));
			}

			form.addEventListener('change', save);
			form.addEventListener('submit', save);
		});
	}

	function initKeyboardShortcuts() {
		document.addEventListener('keydown', (ev) => {
			if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA' || ev.target.isContentEditable)) return;
			if (ev.key === 'f') {
				const sel = q('form.filters select');
				if (sel) sel.focus();
			}
			if (ev.key === 'r') {
				// try to submit a refresh button in the first filters form
				const form = q('form.filters');
				if (form) {
					const refresh = q('button[name="refresh"][value="1"]', form) || q('button.secondary', form);
					if (refresh) refresh.click();
					else form.requestSubmit?.();
				}
			}
		});
	}

	function init() {
		initChartTooltips();
		initLegendHighlight();
		initFilterPersistence();
		initKeyboardShortcuts();
		initSVGAnimations();
		initCustomSelects();
		initCardTilt();
		initPageReveals();
	}

	if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
	else init();

})();
*/

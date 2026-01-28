
/**
 * Nuvabase Table Engine
 * Hardened CRUD logic with Column-level Allow-lists and RLS integration.
 */
import { api } from './api.js';

export const tables = {
    currentTableName: 'users',
    currentRows: [],
    isActionLoading: false,
    editingCell: null,
    
    // Schema definitions matching the architectural blueprint
    // Default-deny approach.
    schema: {
        users: {
            display: ['user_id', 'name', 'email', 'role', 'is_online', 'is_tracking_active'],
            writable: ['name', 'email', 'role', 'photo_url', 'is_online', 'is_tracking_active'],
            protected: ['user_id', 'tenant_id', 'password', 'last_sync', 'created_at', 'updated_at']
        },
        followups: {
            display: ['id', 'subject', 'status', 'followup_date'],
            writable: ['client_id', 'subject', 'notes', 'followup_date', 'status'],
            protected: ['id', 'user_id', 'tenant_id', 'created_at', 'updated_at']
        },
        daily_activity: {
            display: ['id', 'name', 'type', 'activity_date', 'location'],
            writable: ['activity_date', 'type', 'location', 'latitude', 'longitude', 'description', 'details', 'name'],
            protected: ['id', 'user_id', 'tenant_id', 'created_at', 'updated_at']
        }
    },

    init() {
        const selector = document.getElementById('table-selector');
        const addBtn = document.getElementById('add-row-btn');
        const form = document.getElementById('row-form');

        if (selector) {
            selector.onchange = (e) => {
                this.currentTableName = e.target.value;
                this.fetchData();
            };
        }

        if (addBtn) addBtn.onclick = () => this.openModal(null);
        
        if (form) {
            form.onsubmit = async (e) => {
                e.preventDefault();
                await this.handleSave();
            };
        }

        this.fetchData();
    },

    async fetchData() {
        this.toggleLoading(true);
        try {
            if (!this.schema[this.currentTableName]) {
                throw new Error("Endpoint not registered in safety allow-list.");
            }

            const data = await api.get(`/${this.currentTableName}`);
            this.currentRows = Array.isArray(data) ? data : [];
            this.renderGrid();
        } catch (err) {
            console.error('Fetch failed:', err);
            this.currentRows = [];
            this.renderGrid();
            alert(`Platform Security Reject: ${err.message}`);
        } finally {
            this.toggleLoading(false);
        }
    },

    renderGrid() {
        const head = document.getElementById('table-head');
        const body = document.getElementById('table-body');
        const empty = document.getElementById('empty-state');
        const count = document.getElementById('row-count');
        
        const config = this.schema[this.currentTableName];
        if (!config) return;

        const columns = config.display;
        const writable = config.writable;
        const protectedFields = config.protected;

        if (!head || !body) return;

        head.innerHTML = `
            <tr>
                <th class="w-10"><input type="checkbox" class="rounded border-[#30363d] bg-transparent"></th>
                ${columns.map(col => `<th>${col.replace('_', ' ')}</th>`).join('')}
                <th class="text-right px-6">Actions</th>
            </tr>
        `;

        if (this.currentRows.length === 0) {
            body.innerHTML = '';
            if (empty) empty.classList.remove('hidden');
        } else {
            if (empty) empty.classList.add('hidden');
            body.innerHTML = this.currentRows.map((row, idx) => {
                const id = row.id || row.user_id;
                return `
                <tr class="animate-fadeIn group" style="animation-delay: ${idx * 20}ms">
                    <td class="w-10"><input type="checkbox" class="rounded border-[#30363d] bg-transparent"></td>
                    ${columns.map(col => {
                        const isWritable = writable.includes(col) && !protectedFields.includes(col);
                        const val = row[col];
                        return `
                            <td 
                                data-col="${col}"
                                data-id="${id}"
                                class="${col.includes('id') ? 'font-mono text-[11px] opacity-70' : ''} ${isWritable ? 'editable-cell' : ''}"
                                ${isWritable ? `onclick="window.tables.startCellEdit(event, '${id}', '${col}')"` : ''}
                            >
                                <span class="cell-value">${this.formatValue(val)}</span>
                            </td>
                        `;
                    }).join('')}
                    <td class="text-right px-6">
                        <div class="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onclick="window.tables.openModal('${id}')" title="Edit Record" class="p-2 text-[#9b9b9b] hover:text-[#3ecf8e] hover:bg-[#3ecf8e]/10 rounded-lg transition-all">
                                <svg size="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                            </button>
                            <button onclick="window.tables.deleteRow('${id}')" title="Delete Record" class="p-2 text-[#9b9b9b] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all">
                                <svg size="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-4 h-4"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                            </button>
                        </div>
                    </td>
                </tr>
            `}).join('');
        }
        
        if (count) count.innerText = `${this.currentRows.length} rows`;
    },

    formatValue(val) {
        if (typeof val === 'boolean') return val ? 'true' : 'false';
        if (val === null || val === undefined) return '<span class="italic opacity-30">null</span>';
        return val;
    },

    startCellEdit(event, id, col) {
        if (event.target.tagName === 'INPUT' || this.isActionLoading) return;
        
        const cell = event.currentTarget;
        if (this.editingCell === cell) return;
        
        const row = this.currentRows.find(r => (r.id || r.user_id) === id);
        if (!row) return;

        this.editingCell = cell;
        const originalValue = row[col];
        const displayValue = typeof originalValue === 'boolean' ? originalValue.toString() : (originalValue || '');

        cell.classList.add('is-editing');
        cell.innerHTML = '';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.value = displayValue;
        input.className = 'w-full bg-[#0d1117] border border-[#3ecf8e] rounded px-2 py-0.5 text-xs text-white focus:outline-none focus:ring-0 h-full min-h-[28px]';
        
        let finished = false;
        const finishEdit = async () => {
            if (finished) return;
            finished = true;
            const newValue = input.value;
            this.editingCell = null;
            await this.saveCellValue(id, col, newValue, cell);
        };

        input.onblur = finishEdit;
        input.onkeydown = (e) => {
            if (e.key === 'Enter') {
                input.blur(); 
            } else if (e.key === 'Escape') {
                finished = true;
                this.editingCell = null;
                this.renderGrid(); 
            }
        };

        cell.appendChild(input);
        input.focus();
        input.select();
    },

    async saveCellValue(id, col, val, cellElement) {
        const config = this.schema[this.currentTableName];
        // CRITICAL: Blocked even on client-side bypass attempt
        if (config.protected.includes(col)) {
            console.error(`SECURITY LOCK: Attempted to write to protected column '${col}'.`);
            this.renderGrid();
            return;
        }

        const row = this.currentRows.find(r => (r.id || r.user_id) === id);
        if (!row) return;

        let typedValue = val;
        if (val.toLowerCase() === 'true') typedValue = true;
        else if (val.toLowerCase() === 'false') typedValue = false;
        else if (!isNaN(val) && val.trim() !== '') typedValue = parseFloat(val);
        
        if (row[col] === typedValue) {
            this.renderGrid();
            return;
        }

        this.isActionLoading = true;
        if (cellElement) cellElement.classList.add('is-saving');
        
        try {
            await api.patch(`/${this.currentTableName}/${id}`, { [col]: typedValue });
            row[col] = typedValue;
            this.renderGrid();
        } catch (err) {
            console.error('Cell update failed:', err);
            alert('Platform Guard Reject: ' + err.message);
            this.renderGrid(); 
        } finally {
            this.isActionLoading = false;
            if (cellElement) cellElement.classList.remove('is-saving');
        }
    },

    openModal(id) {
        const modal = document.getElementById('row-modal');
        const title = document.getElementById('modal-title');
        const fieldsContainer = document.getElementById('form-fields');
        const config = this.schema[this.currentTableName];
        
        const row = id ? this.currentRows.find(r => (r.id || r.user_id) === id) : null;
        
        if (title) title.innerText = row ? `Edit Record: ${id}` : `Insert Row into ${this.currentTableName}`;
        if (modal) modal.dataset.editingId = id || '';

        if (fieldsContainer) {
            fieldsContainer.innerHTML = config.writable
                .filter(field => !config.protected.includes(field))
                .map(field => `
                    <div class="space-y-1.5">
                        <label class="block text-[10px] font-black uppercase tracking-widest text-[#444]">${field.replace('_', ' ')}</label>
                        ${this.renderInput(field, row ? row[field] : '')}
                    </div>
                `).join('');
        }

        if (modal) modal.classList.remove('hidden');
        
        const firstInput = fieldsContainer?.querySelector('input, select');
        if (firstInput) setTimeout(() => firstInput.focus(), 100);
    },

    renderInput(field, value) {
        if (field.includes('is_')) {
            return `
                <select name="${field}" class="w-full bg-[#0d1117] border border-[#2e2e2e] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#3ecf8e] focus:outline-none transition-colors">
                    <option value="true" ${value === true ? 'selected' : ''}>true</option>
                    <option value="false" ${value === false ? 'selected' : ''}>false</option>
                </select>
            `;
        }
        return `<input name="${field}" type="text" value="${value || ''}" class="w-full bg-[#0d1117] border border-[#2e2e2e] rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#3ecf8e] focus:outline-none transition-colors" />`;
    },

    async handleSave() {
        const modal = document.getElementById('row-modal');
        const id = modal ? modal.dataset.editingId : null;
        const form = document.getElementById('row-form');
        const saveBtn = form?.querySelector('button[type="submit"]');
        
        if (!form) return;
        const formData = new FormData(form);
        const payload = {};

        const config = this.schema[this.currentTableName];

        formData.forEach((value, key) => {
            if (config.protected.includes(key)) return;

            if (value === 'true') payload[key] = true;
            else if (value === 'false') payload[key] = false;
            else payload[key] = value;
        });

        try {
            if (saveBtn) saveBtn.innerHTML = '<div class="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div> Saving...';
            this.toggleLoading(true);
            
            if (id) {
                await api.patch(`/${this.currentTableName}/${id}`, payload);
            } else {
                await api.post(`/${this.currentTableName}`, payload);
            }

            if (modal) modal.classList.add('hidden');
            await this.fetchData();
        } catch (err) {
            console.error('Save failed:', err);
            alert('Platform Guard Reject: ' + err.message);
        } finally {
            if (saveBtn) saveBtn.innerText = 'Save Changes';
            this.toggleLoading(false);
        }
    },

    async deleteRow(id) {
        const confirmed = confirm(`PERMANENT DELETION WARNING\n\nThis will permanently remove record ${id} from the production shard. This action cannot be undone.\n\nAre you absolutely sure?`);
        if (!confirmed) return;

        this.toggleLoading(true);
        try {
            await api.delete(`/${this.currentTableName}/${id}`);
            await this.fetchData();
        } catch (err) {
            console.error('Delete failed:', err);
            alert('Platform Guard Reject: ' + err.message);
        } finally {
            this.toggleLoading(false);
        }
    },

    toggleLoading(show) {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) overlay.classList.toggle('hidden', !show);
    }
};

window.tables = tables;

<template>
  <div class="admin-page spacing">
    <div class="card">
      <h1>Управление подбором по сфере применения</h1>
      <p class="muted">
        Редактируйте сферы применения и привязывайте товары по ID. Изменения сохраняются в Google Sheets и локально.
      </p>

      <div v-if="!isAdmin" class="admin-warning">
        <p>Для редактирования включите режим администратора (isAdmin в localStorage).</p>
      </div>

      <template v-else>
        <div v-if="loading" class="loading-state">Загрузка...</div>
        <template v-else>
          <div class="substances-editor">
            <div
              v-for="(app, idx) in applications"
              :key="app.id"
              class="substance-editor-item"
            >
              <div class="substance-row">
                <div class="substance-field">
                  <label>ID</label>
                  <input v-model="app.id" type="text" placeholder="kotelnye-i-topochnye" />
                </div>
                <div class="substance-field flex-grow">
                  <label>Название</label>
                  <input v-model="app.name" type="text" placeholder="Котельные и топочные" />
                </div>
                <div class="substance-field flex-grow">
                  <label>Название (каз.)</label>
                  <input v-model="app.nameKz" type="text" placeholder="Қазандықтар және ошақтар" />
                </div>
                <button
                  v-if="applications.length > 1"
                  type="button"
                  class="btn danger small"
                  @click="removeApplication(idx)"
                >
                  Удалить
                </button>
              </div>
              <div class="substance-field">
                <label>Описание (необязательно)</label>
                <input v-model="app.description" type="text" placeholder="" />
              </div>
              <div class="substance-field">
                <label>Описание (каз., необязательно)</label>
                <input v-model="app.descriptionKz" type="text" placeholder="" />
              </div>
              <div class="substance-field">
                <label>ID товаров (через запятую)</label>
                <input
                  v-model="productIdsStr[idx]"
                  type="text"
                  placeholder="fp34, fp23, fst-03v1"
                  @input="onProductIdsInput(idx, $event)"
                />
              </div>
            </div>
          </div>

          <div class="actions">
            <button type="button" class="btn secondary" @click="addApplication">
              + Добавить сферу
            </button>
            <button
              type="button"
              class="btn primary"
              :disabled="saving"
              @click="saveApplications"
            >
              {{ saving ? 'Сохранение...' : 'Сохранить сферы применения' }}
            </button>
          </div>

          <div v-if="saveResult" class="result-box" :class="saveResult.success ? 'success' : 'error'">
            {{ saveResult.message }}
          </div>
        </template>
      </template>

      <div class="info-section" style="margin-top: 32px">
        <h3>Как это работает</h3>
        <ul class="info-list">
          <li>Лист «Applications» в Google Sheets: колонки id, name, nameKz, description, descriptionKz, productIds</li>
          <li>productIds — ID товаров через запятую (например: fp34, fp23)</li>
          <li>Можно редактировать и в Google Sheets, затем нажать «Обновить каталог»</li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
const loading = ref(true);
const saving = ref(false);
const saveResult = ref(null);
const applications = ref([]);
const productIdsStr = ref([]);

const isAdmin = computed(() => {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('isAdmin') === 'true';
});

function onProductIdsInput(idx, e) {
  const val = e?.target?.value ?? '';
  const ids = val.split(/[,;\s]+/).map((s) => s.trim()).filter(Boolean);
  applications.value[idx].productIds = ids;
}

function syncProductIdsStr() {
  productIdsStr.value = applications.value.map((a) =>
    Array.isArray(a.productIds) ? a.productIds.join(', ') : ''
  );
}

function addApplication() {
  applications.value.push({
    id: '',
    name: '',
    nameKz: '',
    description: '',
    descriptionKz: '',
    productIds: [],
  });
  productIdsStr.value.push('');
}

function removeApplication(idx) {
  applications.value.splice(idx, 1);
  productIdsStr.value.splice(idx, 1);
}

async function loadApplications() {
  loading.value = true;
  try {
    const data = await $fetch('/data/applications.json');
    applications.value = Array.isArray(data)
      ? data.map((a) => ({
          id: a.id,
          name: a.name,
          nameKz: a.nameKz || '',
          description: a.description || '',
          descriptionKz: a.descriptionKz || '',
          productIds: Array.isArray(a.productIds) ? [...a.productIds] : [],
        }))
      : [];
    syncProductIdsStr();
  } catch {
    applications.value = [];
    productIdsStr.value = [];
  } finally {
    loading.value = false;
  }
}

async function saveApplications() {
  saving.value = true;
  saveResult.value = null;
  try {
    const res = await $fetch('/api/applications-update', {
      method: 'POST',
      body: { applications: applications.value },
    });
    saveResult.value = { success: true, message: res.message };
    syncProductIdsStr();
  } catch (e) {
    saveResult.value = {
      success: false,
      message: e.data?.statusMessage || e.message || 'Ошибка сохранения',
    };
  } finally {
    saving.value = false;
  }
}

onMounted(loadApplications);
</script>

<style scoped>
.admin-page {
  max-width: 900px;
  margin: 0 auto;
}
.card {
  background: #fff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.substance-editor-item {
  padding: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  margin-bottom: 16px;
  background: #fafafa;
}
.substance-row {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  flex-wrap: wrap;
}
.substance-field {
  min-width: 120px;
}
.substance-field.flex-grow {
  flex: 1;
  min-width: 200px;
}
.substance-field label {
  display: block;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}
.substance-field input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
}
.actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}
.result-box {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 8px;
}
.result-box.success {
  background: #dcfce7;
  color: #166534;
}
.result-box.error {
  background: #fee2e2;
  color: #991b1b;
}
.admin-warning {
  padding: 16px;
  background: #fef3c7;
  border-radius: 8px;
  color: #92400e;
}
.loading-state {
  padding: 24px;
  text-align: center;
  color: #64748b;
}
.btn.small {
  padding: 6px 12px;
  font-size: 13px;
}
.btn.danger {
  background: #dc2626;
  color: #fff;
}
</style>

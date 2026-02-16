<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="modal-overlay"
      @click="closeModal"
    >
      <div class="modal-content" @click.stop>
        <button class="modal-close" @click="closeModal" :aria-label="t('order.close')">
          ×
        </button>
        
        <h2 class="modal-title">{{ t('order.title') }}</h2>
        
        <div class="product-name-display">
          <strong>{{ productName }}</strong>
        </div>

        <form @submit.prevent="handleSubmit" class="order-form">
          <div class="form-group full-width">
            <label class="form-label">{{ t('order.applicantType') }}</label>
            <div class="switch-container">
              <span :class="['switch-label', { active: !isLegalEntity }]">
                {{ t('order.individual') }}
              </span>
              <label class="switch">
                <input
                  type="checkbox"
                  v-model="isLegalEntity"
                />
                <span class="slider"></span>
              </label>
              <span :class="['switch-label', { active: isLegalEntity }]">
                {{ t('order.legal') }}
              </span>
            </div>
          </div>

          <div v-if="isLegalEntity" class="form-group">
            <label for="companyName" class="form-label">
              {{ t('order.companyName') }} <span class="required">{{ t('order.required') }}</span>
            </label>
            <input
              id="companyName"
              v-model="formData.companyName"
              type="text"
              class="form-input"
              required
              :placeholder="t('order.companyNamePlaceholder')"
            />
          </div>

          <div v-if="isLegalEntity" class="form-group">
            <label for="contactPerson" class="form-label">
              {{ t('order.contactPerson') }} <span class="required">{{ t('order.required') }}</span>
            </label>
            <input
              id="contactPerson"
              v-model="formData.contactPerson"
              type="text"
              class="form-input"
              required
              :placeholder="t('order.contactPersonPlaceholder')"
            />
          </div>

          <div v-if="!isLegalEntity" class="form-group">
            <label for="fullName" class="form-label">
              {{ t('order.fullName') }} <span class="required">{{ t('order.required') }}</span>
            </label>
            <input
              id="fullName"
              v-model="formData.fullName"
              type="text"
              class="form-input"
              required
              :placeholder="t('order.fullNamePlaceholder')"
            />
          </div>

          <div class="form-group">
            <label for="phone" class="form-label">
              {{ t('order.phone') }} <span class="required">{{ t('order.required') }}</span>
            </label>
            <input
              id="phone"
              v-model="formData.phone"
              type="tel"
              class="form-input"
              required
              :placeholder="t('order.phonePlaceholder')"
            />
          </div>

          <div class="form-group">
            <label for="email" class="form-label">
              {{ t('order.email') }} <span class="required">{{ t('order.required') }}</span>
            </label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              class="form-input"
              required
              :placeholder="t('order.emailPlaceholder')"
            />
          </div>

          <div v-if="isLegalEntity" class="form-group full-width">
            <label for="requisites" class="form-label">{{ t('order.requisites') }}</label>
            <textarea
              id="requisites"
              v-model="formData.requisites"
              class="form-textarea"
              rows="4"
              :placeholder="t('order.requisitesHint')"
            ></textarea>
          </div>

          <div class="form-group full-width">
            <label for="message" class="form-label">{{ t('order.message') }}</label>
            <textarea
              id="message"
              v-model="formData.message"
              class="form-textarea"
              rows="4"
              :placeholder="t('order.messagePlaceholder')"
            ></textarea>
          </div>

          <div class="form-group full-width">
            <label class="checkbox-label">
              <input
                type="checkbox"
                v-model="formData.agreeToPrivacy"
                required
                class="checkbox-input"
              />
              <span class="checkbox-text">
                {{ t('order.privacy') }}
                <span class="required">{{ t('order.required') }}</span>
              </span>
            </label>
          </div>

          <div v-if="errorMessage" class="error-message full-width">
            {{ errorMessage }}
          </div>
          <div class="form-actions full-width">
            <button type="button" class="btn-secondary" @click="closeModal" :disabled="isLoading">
              {{ t('order.cancel') }}
            </button>
            <button type="submit" class="btn-primary" :disabled="isLoading">
              <span v-if="isLoading">{{ t('order.sending') }}</span>
              <span v-else>{{ t('order.submit') }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue';

const { t } = useI18n();

const isLoading = ref(false);
const errorMessage = ref('');

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  productName: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['close', 'submit']);

const isLegalEntity = ref(false);
const formData = ref({
  companyName: '',
  contactPerson: '',
  fullName: '',
  phone: '',
  email: '',
  requisites: '',
  message: '',
  agreeToPrivacy: false
});

const closeModal = () => {
  emit('close');
  resetForm();
};

const resetForm = () => {
  formData.value = {
    companyName: '',
    contactPerson: '',
    fullName: '',
    phone: '',
    email: '',
    requisites: '',
    message: '',
    agreeToPrivacy: false
  };
  isLegalEntity.value = false;
};

const handleSubmit = async () => {
  const config = useRuntimeConfig().public;
  const apiKey = config.staticFormsApiKey;
  if (!apiKey) {
    errorMessage.value = 'Форма не настроена (отсутствует API ключ StaticForms).';
    alert(errorMessage.value);
    return;
  }

  // Данные для emit (англ. ключи)
  const submitData = {
    productName: props.productName,
    isLegalEntity: isLegalEntity.value,
    companyName: formData.value.companyName,
    contactPerson: formData.value.contactPerson,
    fullName: formData.value.fullName,
    phone: formData.value.phone,
    email: formData.value.email,
    requisites: formData.value.requisites,
    message: formData.value.message
  };

  // Payload для StaticForms: русские подписи полей в письме
  const staticFormsPayload = {
    apiKey,
    subject: props.productName ? `Новая заявка: ${props.productName}` : 'Новая заявка с сайта',
    'Товар': props.productName || '—',
    'Тип заявителя': isLegalEntity.value ? 'Юридическое лицо' : 'Физическое лицо',
    'Компания': formData.value.companyName || '—',
    'Контактное лицо': formData.value.contactPerson || '—',
    'ФИО': formData.value.fullName || '—',
    'Телефон': formData.value.phone,
    'Email': formData.value.email,
    'Реквизиты': formData.value.requisites || '—',
    'Сообщение': formData.value.message || '—'
  };

  isLoading.value = true;
  errorMessage.value = '';

  try {
    const response = await $fetch('https://api.staticforms.dev/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: staticFormsPayload
    });

    if (response?.success !== false) {
      emit('submit', submitData);
      closeModal();
      alert('Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.');
    } else {
      throw new Error(response?.message || 'Ошибка при отправке заявки');
    }
  } catch (error) {
    console.error('Ошибка отправки заявки:', error);
    const msg = error?.data?.message || error?.message || 'Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже.';
    errorMessage.value = msg;
    alert(msg);
  } finally {
    isLoading.value = false;
  }
};

// Закрытие по Escape
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }
});
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 20px;
  animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.modal-content {
  background: #ffffff;
  border-radius: 16px;
  padding: 32px;
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: #f5f5f5;
  border-radius: 50%;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #52606d;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #e5e7eb;
  color: #1f2933;
}

.modal-title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: #1f2933;
}

.product-name-display {
  background: #f8fafc;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 24px;
  color: #52606d;
  font-size: 0.95rem;
}

.product-name-display strong {
  color: #16396C;
  font-weight: 600;
}

.order-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

@media (min-width: 768px) {
  .order-form {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
  }

  .form-group.full-width {
    grid-column: 1 / -1;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 600;
  color: #1f2933;
  font-size: 0.95rem;
}

.required {
  color: #ef4444;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.2s ease;
  background: #ffffff;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #16396C;
  box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.form-hint {
  font-size: 0.85rem;
  color: #9ca3af;
}

.switch-container {
  display: flex;
  align-items: center;
  gap: 12px;
}

.switch-label {
  font-size: 0.9rem;
  color: #9ca3af;
  transition: color 0.2s ease;
}

.switch-label.active {
  color: #16396C;
  font-weight: 600;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #cbd5e1;
  transition: 0.3s;
  border-radius: 26px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #16396C;
}

input:checked + .slider:before {
  transform: translateX(24px);
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  cursor: pointer;
}

.checkbox-input {
  width: 18px;
  height: 18px;
  margin-top: 2px;
  cursor: pointer;
  flex-shrink: 0;
}

.checkbox-text {
  font-size: 0.9rem;
  color: #52606d;
  line-height: 1.5;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn-secondary,
.btn-primary {
  flex: 1;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-secondary {
  background: #f5f5f5;
  color: #52606d;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.btn-primary {
  background: #16396C;
  color: #ffffff;
}

.btn-primary:hover:not(:disabled) {
  background: #1565c0;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(30, 136, 229, 0.3);
}

.btn-primary:disabled,
.btn-secondary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #fcc;
  font-size: 0.9rem;
  margin-bottom: 16px;
}

@media (min-width: 768px) {
  .modal-content {
    max-width: 900px;
  }
}

@media (max-width: 767px) {
  .modal-content {
    padding: 24px;
    max-height: 95vh;
    max-width: 100%;
  }

  .modal-title {
    font-size: 1.5rem;
  }

  .order-form {
    display: flex;
    flex-direction: column;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-secondary,
  .btn-primary {
    width: 100%;
  }
}
</style>

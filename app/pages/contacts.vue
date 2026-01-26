<template>
  <div class="spacing">
    <section class="section">
      <div class="card">
        <h1>{{ t('contacts.title') }}</h1>
        <p class="muted">
          {{ t('contacts.subtitle') }}
        </p>
        <div class="split" style="margin-top: 24px">
          <div class="contact-card">
            <a :href="`tel:${t('contacts.phoneLink')}`" class="contact-phone">{{ t('contacts.phone') }}</a>
            <a :href="`mailto:${t('contacts.email')}`" class="contact-email">{{ t('contacts.email') }}</a>
          </div>
        </div>
      </div>
    </section>

    <section class="section split">
      <div class="card">
        <h3>{{ t('contacts.schedule') }}</h3>
        <p class="muted">
          {{ t('contacts.scheduleText') }}<br />
          {{ t('contacts.lunch') }}
        </p>
      </div>
      <div class="card">
        <h3>{{ t('contacts.address') }}</h3>
        <p class="muted">{{ t('contacts.addressText') }}</p>
      </div>
    </section>

    <!-- Форма обратной связи -->
    <section class="section">
      <div class="card">
        <h2>{{ t('contacts.contactUs') }}</h2>
        <p class="muted">
          {{ t('contacts.contactDesc') }}
        </p>
        
        <form @submit.prevent="handleSubmit" class="contact-form">
          <div class="form-group">
            <label for="fullName" class="form-label">
              {{ t('contacts.formFullName') }} <span class="required">*</span>
            </label>
            <input
              id="fullName"
              v-model="formData.fullName"
              type="text"
              class="form-input"
              required
              :placeholder="t('contacts.formFullNamePlaceholder')"
            />
          </div>

          <div class="form-group">
            <label for="phone" class="form-label">
              {{ t('contacts.formPhone') }} <span class="required">*</span>
            </label>
            <input
              id="phone"
              v-model="formData.phone"
              type="tel"
              class="form-input"
              required
              :placeholder="t('contacts.formPhonePlaceholder')"
            />
          </div>

          <div class="form-group">
            <label for="email" class="form-label">
              {{ t('contacts.formEmail') }} <span class="required">*</span>
            </label>
            <input
              id="email"
              v-model="formData.email"
              type="email"
              class="form-input"
              required
              :placeholder="t('contacts.formEmailPlaceholder')"
            />
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <div v-if="successMessage" class="success-message">
            {{ successMessage }}
          </div>

          <div class="form-actions">
            <button type="submit" class="btn primary" :disabled="isLoading">
              <span v-if="isLoading">{{ t('contacts.formSending') }}</span>
              <span v-else>{{ t('contacts.formSubmit') }}</span>
            </button>
          </div>
        </form>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const { t } = useI18n();

const formData = ref({
  fullName: '',
  phone: '',
  email: ''
});

const isLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const handleSubmit = async () => {
  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';
  
  try {
    // Отправляем данные на сервер
    const response = await $fetch('/api/send-email', {
      method: 'POST',
      body: {
        isLegalEntity: false,
        fullName: formData.value.fullName,
        phone: formData.value.phone,
        email: formData.value.email,
        message: '',
        productName: ''
      }
    });
    
    if (response.success) {
      successMessage.value = t('contacts.formSuccess') || 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.';
      // Очищаем форму
      formData.value = {
        fullName: '',
        phone: '',
        email: ''
      };
    } else {
      throw new Error(response.message || 'Ошибка при отправке заявки');
    }
  } catch (error) {
    console.error('Ошибка отправки заявки:', error);
    errorMessage.value = error.message || t('contacts.formError') || 'Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже.';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.contact-card {
  display: grid;
  gap: 12px;
  
  .contact-phone {
    color: #1e88e5;
    font-size: 20px;
    font-weight: 600;
    text-decoration: none;
    transition: color 0.2s ease;
    
    &:hover {
      color: #1565c0;
      text-decoration: underline;
    }
  }
  
  .contact-email {
    color: #52606d;
    text-decoration: none;
    transition: color 0.2s ease;
    
    &:hover {
      color: #1e88e5;
      text-decoration: underline;
    }
  }
}

.contact-form {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
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

.form-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.2s ease;
  background: #ffffff;
  
  &:focus {
    outline: none;
    border-color: #1e88e5;
    box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.1);
  }
}

.error-message {
  background: #fee;
  color: #c33;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #fcc;
  font-size: 0.9rem;
}

.success-message {
  background: #efe;
  color: #3c3;
  padding: 12px 16px;
  border-radius: 8px;
  border: 1px solid #cfc;
  font-size: 0.9rem;
}

.form-actions {
  margin-top: 8px;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &.primary {
    background: #1e88e5;
    color: #ffffff;
    
    &:hover:not(:disabled) {
      background: #1565c0;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(30, 136, 229, 0.3);
    }
    
    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }
}
</style>

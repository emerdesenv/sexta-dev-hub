import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import StudentAuthPage from '../StudentAuthPage.vue';

const mockPush = vi.fn();
const mockAuthStore = {
    login: vi.fn(),
    user: null
};
const mockApiPost = vi.fn();

vi.mock('vue-router', () => ({
    useRouter: () => ({ push: mockPush })
}));

vi.mock('../../stores/auth', () => ({
    useAuthStore: () => mockAuthStore
}));

vi.mock('../../services/api', () => ({
    default: {
        post: (...args) => mockApiPost(...args)
    }
}));

function mountPage() {
    return mount(StudentAuthPage, {
        global: {
            stubs: {
                PublicHeader: { template: '<div />' },
                Footer: { template: '<div />' },
                PasswordInput: {
                    props: ['modelValue', 'label'],
                    emits: ['update:modelValue'],
                    template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" />'
                },
                BaseModal: {
                    props: ['modelValue', 'title'],
                    emits: ['update:modelValue'],
                    template: '<div v-if="modelValue"><slot /></div>'
                }
            }
        }
    });
}

describe('StudentAuthPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAuthStore.user = null;
    });

    it('abre modal de regras ao clicar no botao', async () => {
        const wrapper = mountPage();

        await wrapper.get('button[aria-label="Abrir regras e segurança"]').trigger('click');

        expect(wrapper.text()).toContain('ambiente educacional');
    });

    it('mostra erro de senha diferente no cadastro', async () => {
        const wrapper = mountPage();
        const tabButtons = wrapper.findAll('[role="tab"]');
        await tabButtons[1].trigger('click');

        const inputs = wrapper.findAll('input');
        await inputs[0].setValue('aluno.teste');
        await inputs[1].setValue('SenhaForte456');
        await inputs[2].setValue('OutraSenha999');
        await wrapper.get('form').trigger('submit.prevent');

        expect(wrapper.text()).toContain('Senha e confirmação de senha devem ser iguais.');
    });

    it('mostra mensagem de erro retornada pela API no cadastro', async () => {
        mockApiPost.mockRejectedValueOnce({
            response: {
                data: {
                    message: 'Nome de usuário deve corresponder ao formato aluno.teste'
                }
            }
        });

        const wrapper = mountPage();
        const tabButtons = wrapper.findAll('[role="tab"]');
        await tabButtons[1].trigger('click');

        const inputs = wrapper.findAll('input');
        await inputs[0].setValue('aluno_invalido');
        await inputs[1].setValue('SenhaForte456');
        await inputs[2].setValue('SenhaForte456');
        await wrapper.get('form').trigger('submit.prevent');
        await flushPromises();

        expect(wrapper.text()).toContain('Nome de usuário deve corresponder ao formato aluno.teste');
    });
});

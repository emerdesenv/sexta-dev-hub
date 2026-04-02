const accessCookieName = process.env.AUTH_COOKIE_NAME || 'sdh_auth_token';
const refreshCookieName = process.env.AUTH_REFRESH_COOKIE_NAME || 'sdh_refresh_token';

const openApiDocument = {
    openapi: '3.1.0',
    info: {
        title: 'Dev Hub API',
        version: '1.0.0',
        description: 'Documentacao tecnica e ambiente de testes dos endpoints da API.'
    },
    servers: [
        { url: '/api', description: 'Servidor atual' }
    ],
    tags: [
        { name: 'Health', description: 'Status de disponibilidade da API' },
        { name: 'Auth', description: 'Autenticacao e gestao de conta' },
        { name: 'Episodes', description: 'Catalogo e administracao de episodios' },
        { name: 'Gamification', description: 'Progressao, missoes, ranking e recompensas' },
        { name: 'Events', description: 'Eventos limitados e colecionaveis' },
        { name: 'Community', description: 'Forum, respostas, votos e moderacao' },
        { name: 'Jobs', description: 'Radar de vagas tech com cache de integracao externa' }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            },
            accessCookieAuth: {
                type: 'apiKey',
                in: 'cookie',
                name: accessCookieName
            },
            refreshCookieAuth: {
                type: 'apiKey',
                in: 'cookie',
                name: refreshCookieName
            }
        },
        schemas: {
            HealthResponse: {
                type: 'object',
                properties: {
                    status: { type: 'string', example: 'ok' }
                },
                required: ['status']
            },
            MessageResponse: {
                type: 'object',
                properties: {
                    message: { type: 'string' }
                },
                required: ['message']
            },
            ErrorResponse: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    code: { type: 'string', nullable: true }
                },
                required: ['message']
            },
            User: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 12 },
                    username: { type: 'string', example: 'aluno.silva' },
                    role: { type: 'string', example: 'student' }
                },
                required: ['id', 'username', 'role']
            },
            LoginRequest: {
                type: 'object',
                properties: {
                    username: { type: 'string', example: 'professor.teste' },
                    password: { type: 'string', format: 'password', minLength: 8 }
                },
                required: ['username', 'password']
            },
            LoginResponse: {
                type: 'object',
                properties: {
                    user: { $ref: '#/components/schemas/User' }
                },
                required: ['user']
            },
            RegisterStudentRequest: {
                type: 'object',
                properties: {
                    username: { type: 'string', example: 'aluno.silva' },
                    password: { type: 'string', format: 'password', minLength: 8 },
                    confirmPassword: { type: 'string', format: 'password', minLength: 8 },
                    inviteCode: { type: 'string', example: 'CODIGO-DA-TURMA' }
                },
                required: ['username', 'password', 'confirmPassword']
            },
            RegisterStudentResponse: {
                type: 'object',
                properties: {
                    message: { type: 'string' },
                    requiresApproval: { type: 'boolean' },
                    user: { $ref: '#/components/schemas/User' }
                },
                required: ['message', 'requiresApproval', 'user']
            },
            UpdatePasswordRequest: {
                type: 'object',
                properties: {
                    currentPassword: { type: 'string', format: 'password', minLength: 8 },
                    newPassword: { type: 'string', format: 'password', minLength: 8 },
                    confirmPassword: { type: 'string', format: 'password', minLength: 8 }
                },
                required: ['currentPassword', 'newPassword', 'confirmPassword']
            },
            Episode: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    slug: { type: 'string' },
                    title: { type: 'string' },
                    summary: { type: 'string' },
                    year_target: { type: 'integer' },
                    category: { type: 'string' },
                    episode_type: { type: 'string', enum: ['study', 'assessment'] },
                    assessment_mode: { type: 'string', nullable: true },
                    assessment_config: { type: 'object', nullable: true, additionalProperties: true },
                    max_attempts: { type: 'integer', nullable: true },
                    passing_score: { type: 'integer', nullable: true },
                    xp_reward: { type: 'integer', nullable: true },
                    trophy_tier: { type: 'string', nullable: true },
                    is_published: { type: 'boolean' },
                    early_access_only: { type: 'boolean' },
                    duration_label: { type: 'string', nullable: true },
                    tags: { type: 'array', items: { type: 'string' } },
                    cover_url: { type: 'string', nullable: true },
                    audio_url: { type: 'string', nullable: true },
                    pdf_url: { type: 'string', nullable: true }
                },
                required: ['id', 'slug', 'title', 'year_target', 'category', 'episode_type']
            },
            EpisodeFormData: {
                type: 'object',
                properties: {
                    ordering: { type: 'integer', example: 1 },
                    title: { type: 'string' },
                    summary: { type: 'string' },
                    year_target: { type: 'integer', minimum: 1, maximum: 3 },
                    category: { type: 'string' },
                    episode_type: { type: 'string', enum: ['study', 'assessment'] },
                    assessment_mode: { type: 'string', enum: ['quiz', 'open_text', 'mini_game'], nullable: true },
                    assessment_config: { oneOf: [{ type: 'string' }, { type: 'object', additionalProperties: true }] },
                    max_attempts: { type: 'integer', minimum: 1, maximum: 10 },
                    passing_score: { type: 'integer', minimum: 0, maximum: 100 },
                    time_limit_sec: { type: 'integer', nullable: true },
                    xp_reward: { type: 'integer', minimum: 0, maximum: 1000 },
                    trophy_tier: { type: 'string', enum: ['bronze', 'silver', 'gold', 'platinum'], nullable: true },
                    is_published: { type: 'boolean' },
                    early_access_only: { type: 'boolean' },
                    duration_label: { type: 'string' },
                    tags: { type: 'string', description: 'CSV, ex.: matematica,enem' },
                    cover: { type: 'string', format: 'binary' },
                    audio: { type: 'string', format: 'binary' },
                    pdf: { type: 'string', format: 'binary' }
                }
            },
            GamificationSnapshot: {
                type: 'object',
                additionalProperties: true
            },
            TopicSummary: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    phase: { type: 'integer', nullable: true },
                    classGroup: { type: 'string', nullable: true },
                    isAnonymous: { type: 'boolean' },
                    isMine: { type: 'boolean' },
                    category: { type: 'string' },
                    title: { type: 'string' },
                    content: { type: 'string' },
                    status: { type: 'string' },
                    bestReplyId: { type: 'integer', nullable: true },
                    repliesCount: { type: 'integer' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                    author: { type: 'object', nullable: true, additionalProperties: true }
                },
                required: ['id', 'title', 'content', 'status']
            },
            ReplyPayload: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    topicId: { type: 'integer' },
                    content: { type: 'string' },
                    isOfficial: { type: 'boolean' },
                    isHidden: { type: 'boolean' },
                    votesCount: { type: 'integer' },
                    viewerVoted: { type: 'boolean' },
                    createdAt: { type: 'string', format: 'date-time' },
                    updatedAt: { type: 'string', format: 'date-time' },
                    author: { type: 'object', nullable: true, additionalProperties: true }
                },
                required: ['id', 'topicId', 'content']
            },
            PublicJobListItem: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    title: { type: 'string' },
                    companyName: { type: 'string', nullable: true },
                    location: { type: 'string', nullable: true },
                    workModel: { type: 'string', enum: ['remote', 'hybrid', 'onsite', 'unknown'] },
                    seniority: { type: 'string', enum: ['intern', 'junior', 'mid', 'senior', 'unknown'] },
                    stacks: { type: 'array', items: { type: 'string' } },
                    targetAudience: { type: 'array', items: { type: 'string' } },
                    applyUrl: { type: 'string' },
                    salaryLabel: { type: 'string', nullable: true },
                    source: { type: 'string' },
                    publishedAt: { type: 'string', format: 'date-time', nullable: true },
                    regionTag: { type: 'string', enum: ['brazil', 'abroad', 'mixed', 'unknown'] }
                },
                required: ['id', 'title', 'workModel', 'seniority', 'stacks', 'targetAudience', 'applyUrl', 'source']
            },
            PublicJobsListResponse: {
                type: 'object',
                properties: {
                    items: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/PublicJobListItem' }
                    },
                    pagination: {
                        type: 'object',
                        properties: {
                            page: { type: 'integer' },
                            pageSize: { type: 'integer' },
                            total: { type: 'integer' },
                            hasNext: { type: 'boolean' }
                        },
                        required: ['page', 'pageSize', 'total', 'hasNext']
                    }
                },
                required: ['items', 'pagination']
            },
            PublicJobDetail: {
                type: 'object',
                properties: {
                    id: { type: 'integer' },
                    title: { type: 'string' },
                    companyName: { type: 'string', nullable: true },
                    location: { type: 'string', nullable: true },
                    workModel: { type: 'string', enum: ['remote', 'hybrid', 'onsite', 'unknown'] },
                    seniority: { type: 'string', enum: ['intern', 'junior', 'mid', 'senior', 'unknown'] },
                    contractType: { type: 'string' },
                    stacks: { type: 'array', items: { type: 'string' } },
                    targetAudience: { type: 'array', items: { type: 'string' } },
                    description: { type: 'string', nullable: true },
                    applyUrl: { type: 'string' },
                    salaryLabel: { type: 'string', nullable: true },
                    source: { type: 'string' },
                    sourceUrl: { type: 'string', nullable: true },
                    publishedAt: { type: 'string', format: 'date-time', nullable: true },
                    regionTag: { type: 'string', enum: ['brazil', 'abroad', 'mixed', 'unknown'] }
                },
                required: ['id', 'title', 'workModel', 'seniority', 'contractType', 'stacks', 'targetAudience', 'applyUrl', 'source']
            }
        }
    },
    paths: {
        '/health': {
            get: {
                tags: ['Health'],
                summary: 'Verifica se a API esta online',
                responses: {
                    200: {
                        description: 'API operacional',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/HealthResponse' }
                            }
                        }
                    }
                }
            }
        },
        '/auth/login': {
            post: {
                tags: ['Auth'],
                summary: 'Realiza login e cria sessao',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/LoginRequest' },
                            example: {
                                username: 'professor.teste',
                                password: 'SenhaForte123'
                            }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Login realizado com sucesso',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/LoginResponse' },
                                example: {
                                    user: { id: 1, username: 'professor.teste', role: 'professor' }
                                }
                            }
                        }
                    },
                    400: {
                        description: 'Dados invalidos',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                                example: { message: 'Dados inválidos para login.' }
                            }
                        }
                    },
                    401: {
                        description: 'Credenciais invalidas',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                                example: { message: 'Credenciais inválidas.' }
                            }
                        }
                    },
                    429: {
                        description: 'Muitas tentativas de login',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                                example: { message: 'Muitas tentativas de login. Tente novamente em alguns minutos.' }
                            }
                        }
                    }
                }
            }
        },
        '/auth/refresh': {
            post: {
                tags: ['Auth'],
                summary: 'Renova tokens com base no refresh cookie',
                security: [{ refreshCookieAuth: [] }],
                responses: {
                    200: {
                        description: 'Sessao renovada',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/LoginResponse' }
                            }
                        }
                    },
                    401: { description: 'Sessao invalida ou expirada' }
                }
            }
        },
        '/auth/logout': {
            post: {
                tags: ['Auth'],
                summary: 'Encerra a sessao atual',
                security: [{ refreshCookieAuth: [] }],
                responses: {
                    200: {
                        description: 'Logout efetuado',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/MessageResponse' }
                            }
                        }
                    }
                }
            }
        },
        '/auth/register-student': {
            post: {
                tags: ['Auth'],
                summary: 'Cadastra conta de aluno',
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/RegisterStudentRequest' }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Aluno cadastrado',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/RegisterStudentResponse' }
                            }
                        }
                    },
                    400: { description: 'Dados invalidos' },
                    403: {
                        description: 'Convite invalido',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                                example: { message: 'Código de convite inválido.' }
                            }
                        }
                    },
                    409: {
                        description: 'Usuario em uso',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                                example: { message: 'Nome de usuário já está em uso.' }
                            }
                        }
                    },
                    429: { description: 'Limite de tentativas excedido' }
                }
            }
        },
        '/auth/me': {
            get: {
                tags: ['Auth'],
                summary: 'Retorna dados do usuario autenticado',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Dados do usuario',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/User' }
                            }
                        }
                    },
                    401: { description: 'Nao autenticado' },
                    404: { description: 'Usuario nao encontrado' }
                }
            },
            delete: {
                tags: ['Auth'],
                summary: 'Exclui (soft delete) a conta do aluno autenticado',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Conta excluida',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/MessageResponse' }
                            }
                        }
                    },
                    401: { description: 'Nao autenticado' },
                    403: { description: 'Fluxo nao permitido para este perfil' },
                    404: { description: 'Usuario nao encontrado' }
                }
            }
        },
        '/auth/me/password': {
            patch: {
                tags: ['Auth'],
                summary: 'Atualiza senha do usuario autenticado',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: { $ref: '#/components/schemas/UpdatePasswordRequest' }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Senha atualizada',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/MessageResponse' }
                            }
                        }
                    },
                    400: { description: 'Dados invalidos ou senha atual incorreta' },
                    401: { description: 'Nao autenticado' },
                    404: { description: 'Usuario nao encontrado' }
                }
            }
        },
        '/episodes/public': {
            get: {
                tags: ['Episodes'],
                summary: 'Lista episodios publicados',
                parameters: [
                    { name: 'year', in: 'query', schema: { type: 'integer' } },
                    { name: 'type', in: 'query', schema: { type: 'string', enum: ['study', 'assessment'] } },
                    { name: 'category', in: 'query', schema: { type: 'string' } }
                ],
                responses: {
                    200: {
                        description: 'Lista de episodios',
                        content: {
                            'application/json': {
                                schema: { type: 'array', items: { $ref: '#/components/schemas/Episode' } }
                            }
                        }
                    }
                }
            }
        },
        '/episodes/public/{slug}': {
            get: {
                tags: ['Episodes'],
                summary: 'Detalha episodio publico por slug',
                parameters: [
                    { name: 'slug', in: 'path', required: true, schema: { type: 'string' } }
                ],
                responses: {
                    200: {
                        description: 'Episodio encontrado',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Episode' }
                            }
                        }
                    },
                    404: { description: 'Episodio nao encontrado' }
                }
            }
        },
        '/episodes': {
            get: {
                tags: ['Episodes'],
                summary: 'Lista episodios para administracao',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Lista administrativa',
                        content: {
                            'application/json': {
                                schema: { type: 'array', items: { $ref: '#/components/schemas/Episode' } }
                            }
                        }
                    },
                    401: { description: 'Nao autenticado' }
                }
            },
            post: {
                tags: ['Episodes'],
                summary: 'Cria episodio (professor)',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: { $ref: '#/components/schemas/EpisodeFormData' }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Episodio criado',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Episode' }
                            }
                        }
                    },
                    400: { description: 'Dados invalidos' },
                    401: { description: 'Nao autenticado' },
                    403: {
                        description: 'Acesso restrito a professor',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                                example: { message: 'Acesso negado.' }
                            }
                        }
                    }
                }
            }
        },
        '/episodes/{id}': {
            put: {
                tags: ['Episodes'],
                summary: 'Atualiza episodio (professor)',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'multipart/form-data': {
                            schema: { $ref: '#/components/schemas/EpisodeFormData' }
                        }
                    }
                },
                responses: {
                    200: {
                        description: 'Episodio atualizado',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/Episode' }
                            }
                        }
                    },
                    404: { description: 'Episodio nao encontrado' }
                }
            },
            delete: {
                tags: ['Episodes'],
                summary: 'Remove episodio (professor)',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    { name: 'id', in: 'path', required: true, schema: { type: 'integer' } }
                ],
                responses: {
                    200: {
                        description: 'Episodio removido',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/MessageResponse' }
                            }
                        }
                    },
                    404: { description: 'Episodio nao encontrado' }
                }
            }
        },
        '/gamification/preview': {
            get: {
                tags: ['Gamification'],
                summary: 'Retorna preview estatico da gamificacao',
                responses: {
                    200: {
                        description: 'Preview',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/GamificationSnapshot' }
                            }
                        }
                    }
                }
            }
        },
        '/gamification/leaderboard': {
            get: {
                tags: ['Gamification'],
                summary: 'Ranking de alunos por XP',
                responses: {
                    200: {
                        description: 'Leaderboard',
                        content: {
                            'application/json': {
                                schema: { type: 'array', items: { type: 'object', additionalProperties: true } }
                            }
                        }
                    }
                }
            }
        },
        '/gamification/me': {
            get: {
                tags: ['Gamification'],
                summary: 'Snapshot de gamificacao do usuario autenticado',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Snapshot do usuario',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/GamificationSnapshot' }
                            }
                        }
                    },
                    401: { description: 'Nao autenticado' }
                }
            }
        },
        '/gamification/history/me': {
            get: {
                tags: ['Gamification'],
                summary: 'Historico de eventos e atividades do usuario',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Historico',
                        content: {
                            'application/json': {
                                schema: { type: 'object', additionalProperties: true }
                            }
                        }
                    }
                }
            }
        },
        '/gamification/episodes/{episodeId}/complete': {
            post: {
                tags: ['Gamification'],
                summary: 'Marca episodio como concluido',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                parameters: [{ name: 'episodeId', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    201: { description: 'Concluido e premiado' },
                    200: { description: 'Ja concluido anteriormente' },
                    404: { description: 'Episodio nao encontrado' }
                }
            }
        },
        '/gamification/episodes/{episodeId}/attempts/start': {
            post: {
                tags: ['Gamification'],
                summary: 'Inicia tentativa de episodio avaliativo',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                parameters: [{ name: 'episodeId', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    201: { description: 'Tentativa iniciada' },
                    409: { description: 'Limite de tentativas ou episodio ja concluido' }
                }
            }
        },
        '/gamification/episodes/{episodeId}/attempts/submit': {
            post: {
                tags: ['Gamification'],
                summary: 'Submete respostas de tentativa avaliativa',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                parameters: [{ name: 'episodeId', in: 'path', required: true, schema: { type: 'integer' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    attemptId: { type: 'integer' },
                                    answers: { oneOf: [{ type: 'array', items: { type: 'object', additionalProperties: true } }, { type: 'object', additionalProperties: true }] }
                                },
                                required: ['attemptId', 'answers']
                            },
                            example: {
                                attemptId: 55,
                                answers: [
                                    { questionId: 'q_1', value: 2 },
                                    { questionId: 'q_2', value: 1 }
                                ]
                            }
                        }
                    }
                },
                responses: {
                    200: { description: 'Tentativa avaliada' },
                    404: { description: 'Tentativa ativa nao encontrada' }
                }
            }
        },
        '/gamification/episodes/{episodeId}/attempts/reset': {
            post: {
                tags: ['Gamification'],
                summary: 'Compra novas tentativas de avaliacao com XP',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                parameters: [{ name: 'episodeId', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    200: { description: 'Tentativas liberadas' },
                    400: {
                        description: 'XP insuficiente',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                                example: { message: 'XP insuficiente para desbloquear novas tentativas.' }
                            }
                        }
                    },
                    409: {
                        description: 'Tentativas ainda disponiveis ou episodio ja concluido',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                                example: { message: 'Você ainda possui tentativas disponíveis para este episódio.' }
                            }
                        }
                    }
                }
            }
        },
        '/gamification/missions/{missionKey}/claim': {
            post: {
                tags: ['Gamification'],
                summary: 'Resgata recompensa de missao',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                parameters: [{ name: 'missionKey', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    200: { description: 'Missao resgatada' },
                    404: { description: 'Missao nao encontrada' },
                    409: { description: 'Missao ja resgatada no periodo' }
                }
            }
        },
        '/gamification/rewards/{rewardKey}/redeem': {
            post: {
                tags: ['Gamification'],
                summary: 'Resgata recompensa da loja',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                parameters: [{ name: 'rewardKey', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    200: { description: 'Recompensa resgatada' },
                    400: { description: 'Moedas insuficientes' },
                    404: { description: 'Recompensa nao encontrada' }
                }
            }
        },
        '/gamification/rewards/{rewardKey}/activate': {
            post: {
                tags: ['Gamification'],
                summary: 'Ativa recompensa ja resgatada',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                parameters: [{ name: 'rewardKey', in: 'path', required: true, schema: { type: 'string' } }],
                responses: {
                    200: { description: 'Recompensa ativada' },
                    403: { description: 'Recompensa ainda nao resgatada' }
                }
            }
        },
        '/gamification/admin/metrics': {
            get: {
                tags: ['Gamification'],
                summary: 'Metricas administrativas de gamificacao',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                responses: {
                    200: {
                        description: 'Metricas',
                        content: {
                            'application/json': { schema: { type: 'object', additionalProperties: true } }
                        }
                    },
                    403: { description: 'Acesso restrito a professor' }
                }
            }
        },
        '/events/active': {
            get: {
                tags: ['Events'],
                summary: 'Retorna evento limitado ativo',
                responses: {
                    200: { description: 'Evento ativo ou nulo' }
                }
            }
        },
        '/events/collectibles/me': {
            get: {
                tags: ['Events'],
                summary: 'Lista colecionaveis do usuario autenticado',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                responses: {
                    200: { description: 'Colecionaveis retornados' }
                }
            }
        },
        '/events/{eventId}/claim': {
            post: {
                tags: ['Events'],
                summary: 'Resgata recompensa de evento limitado',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                parameters: [{ name: 'eventId', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    201: { description: 'Evento resgatado' },
                    403: {
                        description: 'Nao elegivel',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                                example: { message: 'Conclua a tarefa do evento antes de resgatar o item.' }
                            }
                        }
                    },
                    404: { description: 'Evento nao encontrado ou inativo' },
                    409: {
                        description: 'Evento ja resgatado',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                                example: { message: 'Você já resgatou este evento.' }
                            }
                        }
                    }
                }
            }
        },
        '/events/admin/items': {
            get: {
                tags: ['Events'],
                summary: 'Lista itens colecionaveis (admin)',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                responses: { 200: { description: 'Lista de itens' } }
            },
            post: {
                tags: ['Events'],
                summary: 'Cria item colecionavel (admin)',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    key: { type: 'string' },
                                    title: { type: 'string' },
                                    type: { type: 'string', enum: ['badge', 'avatar_item'] },
                                    rarity: { type: 'string', enum: ['common', 'rare', 'epic', 'legendary'] },
                                    icon: { type: 'string', nullable: true }
                                },
                                required: ['key', 'title']
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Item criado' },
                    409: { description: 'Key ja em uso' }
                }
            }
        },
        '/events/admin/events': {
            get: {
                tags: ['Events'],
                summary: 'Lista eventos (admin)',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                responses: { 200: { description: 'Lista de eventos' } }
            },
            post: {
                tags: ['Events'],
                summary: 'Cria evento limitado (admin)',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    key: { type: 'string' },
                                    title: { type: 'string' },
                                    description: { type: 'string', nullable: true },
                                    startAt: { type: 'string', format: 'date-time' },
                                    endAt: { type: 'string', format: 'date-time' },
                                    isActive: { type: 'boolean' },
                                    episodeId: { type: 'integer', nullable: true },
                                    rewardItemId: { type: 'integer' }
                                },
                                required: ['key', 'title', 'startAt', 'endAt', 'rewardItemId']
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Evento criado' },
                    400: { description: 'Dados invalidos' },
                    409: { description: 'Key ja em uso' }
                }
            }
        },
        '/community/topics': {
            get: {
                tags: ['Community'],
                summary: 'Lista topicos da comunidade',
                parameters: [
                    { name: 'phase', in: 'query', schema: { type: 'integer' } },
                    { name: 'category', in: 'query', schema: { type: 'string' } },
                    { name: 'status', in: 'query', schema: { type: 'string' } },
                    { name: 'classGroup', in: 'query', schema: { type: 'string' } },
                    { name: 'search', in: 'query', schema: { type: 'string' } },
                    { name: 'removedAuthorsOnly', in: 'query', schema: { type: 'boolean' } }
                ],
                responses: {
                    200: {
                        description: 'Topicos encontrados',
                        content: {
                            'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/TopicSummary' } } }
                        }
                    }
                }
            },
            post: {
                tags: ['Community'],
                summary: 'Cria topico',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    phase: { type: 'integer', nullable: true },
                                    classGroup: { type: 'string', nullable: true },
                                    isAnonymous: { type: 'boolean' },
                                    category: { type: 'string', enum: ['duvida', 'solucao', 'discussao', 'showcase'] },
                                    title: { type: 'string' },
                                    content: { type: 'string' }
                                },
                                required: ['title', 'content']
                            },
                            example: {
                                phase: 2,
                                classGroup: '2A',
                                isAnonymous: true,
                                category: 'duvida',
                                title: 'Dúvida sobre frações equivalentes',
                                content: 'Nao entendi como simplificar 18/24 para a forma irredutivel.'
                            }
                        }
                    }
                },
                responses: {
                    201: { description: 'Topico criado' },
                    422: {
                        description: 'Conteudo bloqueado por moderacao automatica',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/ErrorResponse' },
                                example: {
                                    message: 'Seu texto contém linguagem potencialmente ofensiva. Ajuste a mensagem e tente novamente.'
                                }
                            }
                        }
                    }
                }
            }
        },
        '/community/topics/{id}': {
            get: {
                tags: ['Community'],
                summary: 'Detalha topico e respostas',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: { 200: { description: 'Detalhes do topico' }, 404: { description: 'Topico nao encontrado' } }
            },
            patch: {
                tags: ['Community'],
                summary: 'Atualiza topico',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': { schema: { type: 'object', additionalProperties: true } }
                    }
                },
                responses: {
                    200: { description: 'Topico atualizado' },
                    403: { description: 'Sem permissao para editar' },
                    422: { description: 'Conteudo bloqueado por moderacao automatica' }
                }
            },
            delete: {
                tags: ['Community'],
                summary: 'Exclui topico de autor removido (professor)',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    200: { description: 'Topico excluido' },
                    403: { description: 'Topico nao elegivel para exclusao' }
                }
            }
        },
        '/community/topics/{id}/replies': {
            post: {
                tags: ['Community'],
                summary: 'Cria resposta em topico',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: { content: { type: 'string' } },
                                required: ['content']
                            }
                        }
                    }
                },
                responses: {
                    201: {
                        description: 'Resposta criada',
                        content: {
                            'application/json': { schema: { $ref: '#/components/schemas/ReplyPayload' } }
                        }
                    },
                    409: { description: 'Topico fechado para respostas' }
                }
            }
        },
        '/community/topics/{id}/best-reply': {
            patch: {
                tags: ['Community'],
                summary: 'Define melhor resposta do topico',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: { replyId: { type: 'integer' } },
                                required: ['replyId']
                            }
                        }
                    }
                },
                responses: { 200: { description: 'Melhor resposta definida' } }
            }
        },
        '/community/topics/{id}/status': {
            patch: {
                tags: ['Community'],
                summary: 'Atualiza status de topico (professor)',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', enum: ['open', 'resolved', 'archived', 'hidden'] }
                                },
                                required: ['status']
                            }
                        }
                    }
                },
                responses: { 200: { description: 'Status atualizado' } }
            }
        },
        '/community/replies/{id}/vote': {
            post: {
                tags: ['Community'],
                summary: 'Alterna voto positivo em resposta',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: { 201: { description: 'Voto aplicado' }, 200: { description: 'Voto removido' } }
            }
        },
        '/community/reports': {
            get: {
                tags: ['Community'],
                summary: 'Lista denuncias (professor)',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                parameters: [{ name: 'status', in: 'query', schema: { type: 'string' } }],
                responses: { 200: { description: 'Denuncias retornadas' } }
            },
            post: {
                tags: ['Community'],
                summary: 'Registra denuncia',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    targetType: { type: 'string', enum: ['topic', 'reply'] },
                                    targetId: { type: 'integer' },
                                    reason: { type: 'string' }
                                },
                                required: ['targetType', 'targetId', 'reason']
                            }
                        }
                    }
                },
                responses: { 201: { description: 'Denuncia criada' }, 404: { description: 'Alvo nao encontrado' } }
            }
        },
        '/community/reports/{id}/review': {
            patch: {
                tags: ['Community'],
                summary: 'Revisa denuncia (professor)',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    status: { type: 'string', enum: ['actioned', 'dismissed'] },
                                    reason: { type: 'string', nullable: true }
                                },
                                required: ['status']
                            }
                        }
                    }
                },
                responses: { 200: { description: 'Denuncia revisada' } }
            }
        },
        '/community/moderation/{targetType}/{targetId}': {
            patch: {
                tags: ['Community'],
                summary: 'Modera conteudo diretamente (professor)',
                security: [{ accessCookieAuth: [] }, { bearerAuth: [] }],
                parameters: [
                    { name: 'targetType', in: 'path', required: true, schema: { type: 'string', enum: ['topic', 'reply'] } },
                    { name: 'targetId', in: 'path', required: true, schema: { type: 'integer' } }
                ],
                requestBody: {
                    required: true,
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    action: { type: 'string', enum: ['hide', 'unhide'] },
                                    reason: { type: 'string', nullable: true }
                                },
                                required: ['action']
                            }
                        }
                    }
                },
                responses: { 200: { description: 'Moderacao aplicada' } }
            }
        },
        '/jobs/public': {
            get: {
                tags: ['Jobs'],
                summary: 'Lista vagas publicas com filtros do Radar',
                description:
                    'Retorna apenas vagas ativas cuja data de publicacao (published_at) esta nos ultimos 7 dias.',
                parameters: [
                    { name: 'q', in: 'query', schema: { type: 'string' } },
                    { name: 'seniority', in: 'query', schema: { type: 'string', enum: ['intern', 'junior', 'mid', 'senior'] } },
                    { name: 'workModel', in: 'query', schema: { type: 'string', enum: ['remote', 'hybrid', 'onsite'] } },
                    { name: 'region', in: 'query', schema: { type: 'string', enum: ['brazil', 'abroad'] } },
                    { name: 'stack', in: 'query', schema: { type: 'string' } },
                    { name: 'target', in: 'query', schema: { type: 'string' } },
                    { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
                    { name: 'pageSize', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 5, default: 5 } },
                    { name: 'sort', in: 'query', schema: { type: 'string', enum: ['recent', 'relevance'], default: 'recent' } }
                ],
                responses: {
                    200: {
                        description: 'Lista de vagas retornada',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/PublicJobsListResponse' }
                            }
                        }
                    },
                    400: { description: 'Filtros invalidos' }
                }
            }
        },
        '/jobs/public/{id}': {
            get: {
                tags: ['Jobs'],
                summary: 'Retorna detalhe de vaga publica',
                description:
                    'Somente se a vaga estiver ativa e publicada nos ultimos 7 dias; caso contrario 404.',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    200: {
                        description: 'Detalhe da vaga retornado',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/PublicJobDetail' }
                            }
                        }
                    },
                    400: { description: 'ID invalido' },
                    404: { description: 'Vaga nao encontrada' }
                }
            }
        },
        '/jobs/public/{id}/click': {
            post: {
                tags: ['Jobs'],
                summary: 'Registra clique de candidatura da vaga',
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
                responses: {
                    202: {
                        description: 'Clique registrado',
                        content: {
                            'application/json': {
                                schema: { $ref: '#/components/schemas/MessageResponse' }
                            }
                        }
                    },
                    400: { description: 'ID invalido' },
                    404: { description: 'Vaga nao encontrada' }
                }
            }
        }
    }
};

export default openApiDocument;

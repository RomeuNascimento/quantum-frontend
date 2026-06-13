<!-- RASCUNHO gerado por IA — revisar com advogado(a) antes de publicar; preencher placeholders -->

# Política de Privacidade do Quantum

**Última atualização:** [DATA DE PUBLICAÇÃO]

Esta Política de Privacidade explica, de forma clara, **como o Quantum coleta, usa, compartilha e protege os seus dados pessoais**, em conformidade com a **Lei Geral de Proteção de Dados — LGPD (Lei nº 13.709/2018)** e o **Código de Defesa do Consumidor**.

Sabemos que você é um(a) empreendedor(a) e não advogado(a). Por isso, escrevemos esta política em linguagem acessível, sem deixar de ser juridicamente completa.

---

## 1. Quem é o controlador dos seus dados

O **controlador** dos seus dados pessoais — ou seja, quem decide como eles são tratados — é:

- **Razão social:** **[RAZÃO SOCIAL]**
- **CNPJ:** **[CNPJ]**
- **Endereço:** **[ENDEREÇO]**
- **Contato / Encarregado (DPO):** **[E-MAIL DE CONTATO/DPO]**

O Quantum é o aplicativo web disponível em https://quantumcalc.com.br.

---

## 2. Quais dados coletamos

### 2.1. Dados de cadastro (você fornece)
- **Nome completo**
- **E-mail**
- **Senha** (armazenada de forma criptografada com *hash bcrypt* — não temos acesso à sua senha em texto puro)

### 2.2. Dados do seu negócio (você insere no uso do Serviço)
- Ingredientes, marcas, preços de compra, receitas, produtos, custos fixos, canais de venda e margens.

> Esses dados são, em regra, **informações comerciais do seu negócio**, e não dados pessoais de terceiros. Caso você insira dados pessoais de outras pessoas (por exemplo, nome de um fornecedor ou colaborador), **você atua como controlador desses dados** e é responsável por ter base legal para tratá-los.

### 2.3. Arquivos enviados para a funcionalidade de IA
- **Fotos e PDFs de notas fiscais** e **arquivos de receitas** que você envia para extração automática de dados.
- Esses arquivos **não são armazenados permanentemente** — são usados apenas para a extração e, depois, apenas os **dados extraídos e revisados por você** são salvos (ver Cláusula 5).

### 2.4. Dados de pagamento
- **Não coletamos nem armazenamos dados do seu cartão.** O pagamento é processado pela **Stripe**. Recebemos da Stripe apenas informações sobre o **status da sua assinatura** (ativa, vencida, etc.), não os dados do cartão.

### 2.5. Dados técnicos e de sessão
- **Token de sessão (JWT)** e **cache técnico** armazenados localmente no seu navegador, necessários para manter você autenticado e para o funcionamento do aplicativo (PWA).
- **Não utilizamos cookies de marketing, rastreamento publicitário ou perfilamento.**

---

## 3. Para que usamos seus dados e com qual base legal

A LGPD exige uma **base legal** para cada finalidade de tratamento. Veja abaixo:

| Finalidade | Dados envolvidos | Base legal (LGPD) |
|---|---|---|
| Criar e manter sua conta; autenticar seu acesso | Nome, e-mail, senha (hash), token de sessão | **Execução de contrato** (art. 7º, V) |
| Prestar o Serviço: armazenar e processar os dados do seu negócio, calcular custos e preços | Dados do negócio | **Execução de contrato** (art. 7º, V) |
| Processar a assinatura e o pagamento | E-mail, status de assinatura (via Stripe) | **Execução de contrato** (art. 7º, V) |
| Extrair dados de notas fiscais/receitas via IA | Arquivos enviados e dados extraídos | **Execução de contrato** (art. 7º, V), a seu pedido |
| Enviar comunicações sobre o Serviço (avisos de cobrança, mudanças nos termos, suporte) | Nome, e-mail | **Execução de contrato** e **legítimo interesse** (art. 7º, V e IX) |
| Garantir segurança, prevenir fraudes e abusos | Dados de cadastro e técnicos | **Legítimo interesse** (art. 7º, IX) |
| Cumprir obrigações legais, fiscais e regulatórias | Dados de cadastro e de transação | **Cumprimento de obrigação legal/regulatória** (art. 7º, II) |
| Exercer ou defender direitos em processo | Dados pertinentes | **Exercício regular de direitos** (art. 7º, VI) |

Não realizamos tratamento para finalidades de marketing direto sem consentimento. Caso isso venha a ocorrer no futuro, solicitaremos seu **consentimento** (art. 7º, I) de forma específica e destacada.

---

## 4. Com quem compartilhamos seus dados (operadores e suboperadores)

Para operar o Serviço, contamos com prestadores que tratam dados em nosso nome (**operadores/suboperadores**), sob obrigações contratuais de segurança e confidencialidade:

### 4.1. Stripe (processamento de pagamentos)
- **Finalidade:** processar a assinatura e o pagamento.
- **Dados:** e-mail e dados de pagamento que você fornece diretamente no checkout da Stripe (o Quantum não tem acesso aos dados do cartão).
- **Localização / transferência internacional:** a Stripe está sediada nos **Estados Unidos** e pode tratar dados fora do Brasil — há **transferência internacional de dados** (ver Cláusula 6).

### 4.2. Anthropic (processamento de IA — Claude)
- **Finalidade:** extrair dados de notas fiscais e receitas que você envia.
- **Dados:** o conteúdo dos arquivos enviados por você para extração.
- **Localização / transferência internacional:** a Anthropic está sediada nos **Estados Unidos** — há **transferência internacional de dados** (ver Cláusula 6).

### 4.3. Provedor de infraestrutura
- Hospedamos o Serviço em **servidores próprios (VPS)** com banco de dados PostgreSQL. Os dados são **isolados por usuário** (multi-tenant por identificador de usuário). *(Indicar provedor/local do datacenter — [PROVEDOR/LOCALIZAÇÃO DO SERVIDOR] — recomendado preencher.)*

**Não vendemos seus dados pessoais** nem os compartilhamos com terceiros para fins de marketing.

Podemos compartilhar dados com **autoridades públicas** quando exigido por lei, ordem judicial ou requisição legal válida.

---

## 5. Funcionalidade de IA — como tratamos os arquivos enviados

- Os arquivos (notas fiscais, receitas) que você envia são transmitidos à **API da Anthropic (Claude)** apenas para **extração dos dados**.
- O Quantum **não armazena os arquivos de forma permanente**. Após a extração, **somente os dados que você revisar e confirmar** são salvos na sua conta.
- O processamento ocorre **a seu pedido**, como parte da execução do contrato (você decide quando usar a funcionalidade).
- Esse processamento envolve **transferência internacional** (EUA) — ver Cláusula 6.

---

## 6. Transferência internacional de dados

Parte do tratamento ocorre **fora do Brasil**, nos **Estados Unidos**, em razão do uso da **Stripe** (pagamentos) e da **Anthropic** (IA).

A LGPD permite a transferência internacional (art. 33). Adotamos as garantias cabíveis, tais como **cláusulas contratuais** e compromissos de proteção de dados com esses fornecedores, buscando assegurar nível de proteção compatível com a LGPD. *(A base específica de transferência internacional — cláusulas-padrão, adequação etc. — deve ser validada com advogado, observando a regulamentação da ANPD.)*

Ao utilizar o Serviço e, em especial, a funcionalidade de IA e o pagamento via Stripe, você está **ciente dessa transferência internacional**.

---

## 7. Por quanto tempo guardamos seus dados (retenção e eliminação)

- Mantemos seus dados **enquanto sua conta estiver ativa** e pelo tempo necessário para cumprir as finalidades desta Política.
- **Após o encerramento da conta**, eliminamos ou anonimizamos os dados, **exceto** quando a retenção for necessária para:
  - Cumprir **obrigações legais ou fiscais** (ex.: dados de transações, pelos prazos legais aplicáveis);
  - **Exercício regular de direitos** em processo judicial, administrativo ou arbitral.
- Dados de cadastro e do negócio podem ser **eliminados a seu pedido** a qualquer momento, ressalvadas as hipóteses de guarda obrigatória acima.
- Os **arquivos enviados para a IA** não são retidos permanentemente, conforme a Cláusula 5.

*(Sugestão: definir prazos concretos de retenção pós-cancelamento com advogado/contador — [PRAZO DE RETENÇÃO].)*

---

## 8. Seus direitos como titular (art. 18 da LGPD)

Você tem o direito de, a qualquer momento e gratuitamente:

1. **Confirmar** se tratamos seus dados;
2. **Acessar** seus dados;
3. **Corrigir** dados incompletos, inexatos ou desatualizados;
4. Solicitar **anonimização, bloqueio ou eliminação** de dados desnecessários, excessivos ou tratados em desconformidade com a lei;
5. Solicitar a **portabilidade** dos dados a outro fornecedor, mediante requisição;
6. Solicitar a **eliminação** dos dados tratados com base no consentimento;
7. Obter **informação sobre o compartilhamento** dos seus dados (com quem compartilhamos);
8. Ser informado sobre a **possibilidade de não fornecer consentimento** e as consequências disso;
9. **Revogar o consentimento**, quando aplicável.

### Como exercer seus direitos
Basta enviar um pedido para **[E-MAIL DE CONTATO/DPO]**, informando o e-mail da sua conta. Poderemos solicitar informações adicionais para **confirmar sua identidade** e proteger seus dados. Responderemos no prazo previsto na legislação.

> Você também pode, dentro do próprio aplicativo, **exportar** os dados do seu negócio e **excluir sua conta**, exercendo na prática os direitos de portabilidade e eliminação.

---

## 9. Como protegemos seus dados (segurança)

Adotamos medidas técnicas e organizacionais para proteger seus dados, incluindo:
- **Senhas armazenadas com hash bcrypt** (nunca em texto puro);
- **Autenticação por token (JWT)** e transmissão por **conexão criptografada (HTTPS/TLS)**;
- **Isolamento de dados por usuário** (cada conta acessa apenas os próprios dados);
- **Não armazenamento de dados de cartão** (delegado à Stripe, com padrão PCI-DSS).

Nenhum sistema é 100% imune a falhas, mas trabalhamos continuamente para reduzir riscos.

---

## 10. Incidentes de segurança

Caso ocorra um **incidente de segurança** que possa acarretar risco ou dano relevante aos titulares, **comunicaremos a Autoridade Nacional de Proteção de Dados (ANPD) e os titulares afetados**, em prazo razoável, conforme exige o **art. 48 da LGPD**, informando a natureza do incidente, os dados envolvidos e as medidas tomadas.

---

## 11. Dados de crianças e adolescentes

O Serviço é destinado a **maiores de 18 anos**. Não coletamos intencionalmente dados de menores de idade. Caso identifiquemos tal coleta sem o devido amparo legal, eliminaremos os dados.

---

## 12. Cookies e armazenamento local

Utilizamos **apenas armazenamento local técnico** estritamente necessário ao funcionamento do aplicativo (token de sessão JWT e cache do PWA). **Não usamos cookies de marketing, analytics invasivo ou rastreamento de terceiros.** Se isso mudar no futuro, atualizaremos esta Política e, quando exigido, solicitaremos seu consentimento.

---

## 13. Alterações nesta Política

Podemos atualizar esta Política a qualquer momento. A versão vigente estará sempre disponível no Serviço, com a data da última atualização. Mudanças relevantes serão **comunicadas** pelos canais de contato ou dentro do aplicativo.

---

## 14. Encarregado (DPO) e contato

Para exercer seus direitos, tirar dúvidas ou fazer reclamações sobre o tratamento de dados pessoais:

- **Encarregado / Contato de privacidade:** **[NOME DO ENCARREGADO, se houver]**
- **E-mail:** **[E-MAIL DE CONTATO/DPO]**
- **Controlador:** **[RAZÃO SOCIAL]** — CNPJ **[CNPJ]** — **[ENDEREÇO]**

Você também pode apresentar reclamação à **Autoridade Nacional de Proteção de Dados (ANPD)** — https://www.gov.br/anpd.

---

<!-- FIM DO RASCUNHO — revisar com advogado(a) antes de publicar -->

# 🧾 Projeto Korp - Sistema de Notas Fiscais

**Candidato:** Guilherme Gonzaga

---

Este repositório contém a solução para o desafio técnico "Sistema de Emissão de Notas Fiscais". O projeto foi desenvolvido como uma aplicação full-stack com backend em C# (.NET) e frontend em Angular, utilizando uma arquitetura de microsserviços.

---

### 🛠️ Tecnologias Utilizadas

* **Backend:** C# (.NET 8), ASP.NET Core, Entity Framework Core, SQLite.
* **Frontend:** Angular 17, TypeScript, Angular Material.
* **APIs Externas:** Groq (para funcionalidade de IA com o modelo Llama 3).

---

### 🖥️ Pré-requisitos de Instalação

Para executar este projeto em um novo ambiente, você precisará das seguintes ferramentas:

1.  **Visual Studio 2022 (ou mais recente)**
    * Necessário para rodar o backend C#.
    * Durante a instalação, certifique-se de incluir a carga de trabalho **"Desenvolvimento de ASP.NET e para a Web"**.

2.  **SDK do .NET 8**
    * A plataforma para o C#. Geralmente já vem incluído no Visual Studio 2022.

3.  **Node.js (Frontend)**
    * Necessário para instalar e construir o projeto Angular.
    * **Download:** [nodejs.org](https://nodejs.org/)
    * **Versão:** Baixe e instale a versão **LTS** (Long Term Support).
    * **Instalador:** No Windows, o instalador `.msi` ("Avançar > Avançar > Concluir") é o mais recomendado.

4.  **Angular CLI (Frontend)**
    * A ferramenta de linha de comando (`ng`) para o Angular.
    * Após instalar o Node.js, abra um novo terminal (CMD ou PowerShell) e rode o comando:
        ```bash
        npm install -g @angular/cli
        ```

---

### ⚙️ Configuração Única do Projeto

Antes de rodar pela primeira vez, são necessários 3 passos de configuração:

#### 1. Configurar o Backend (Múltiplos Projetos)

O Visual Studio precisa ser configurado para iniciar os dois microsserviços (Estoque e Faturamento) ao mesmo tempo.

1.  Abra a solução `Backend/KorpTeste.sln` no Visual Studio.
2.  No "Gerenciador de Soluções" (painel à direita), clique com o botão direito em cima da **Solução 'KorpTeste'** (a linha do topo).
3.  Clique em **"Definir Projetos de Inicialização..."** (Set Startup Projects...).
4.  Selecione a opção **"Vários projetos de inicialização"** (Multiple startup projects).
5.  Mude a "Ação" (Action) para **"Iniciar" (Start)** para ambos os projetos de API:
    * `Korp.Estoque.Api` -> **Iniciar**
    * `Korp.Faturamento.Api` -> **Iniciar**
6.  Clique em **Aplicar** e **OK**.

#### 2. Configurar o Frontend (Instalar Pacotes)

O frontend precisa baixar suas dependências (Angular Material, etc.).

1.  Abra um terminal (CMD ou PowerShell).
2.  Navegue até a pasta do projeto frontend:
    ```bash
    cd Frontend/Korp_teste_frontend
    ```
3.  Rode o comando:
    ```bash
    npm install
    ```

#### 3. Configurar a Chave de API (Funcionalidade Opcional de IA)

O projeto usa a API do Groq para a funcionalidade de "Sugerir Descrição". Como a chave de API é secreta, ela não está no GitHub. Para habilitar esta funcionalidade:

1.  No **Visual Studio**, dentro do projeto `Korp.Estoque.Api`.
2.  Clique com o botão direito no projeto > **Adicionar** > **Novo Item...**.
3.  Crie um novo "Arquivo de Configuração JSON" com o nome exato: `appsettings.Development.json`.
4.  Cole o seguinte JSON dentro dele, substituindo `SUA_CHAVE_API` pela sua chave (que pode ser obtida gratuitamente em [console.groq.com](https://console.groq.com/)):

    ```json
    {
      "GroqApiKey": "SUA_CHAVE_API_DO_GROQ_AQUI"
    }
    ```
*Se esta etapa não for realizada, a funcionalidade de IA falhará, mas **todo o resto do sistema (CRUD de Produtos e Faturamento) funcionará perfeitamente**.*

**Nota de Segurança:** A chave de API é um "segredo" e nunca deve ser enviada para um repositório público. Por isso, o arquivo que a contém (`appsettings.Development.json`) está **propositalmente** listado no `.gitignore`. Expor chaves de API públicas é uma falha grave de segurança.

## 🚀 Como Executar o Projeto

Existem duas formas de rodar a aplicação:

### 🔹 1. Modo de Produção (Recomendado – “Junção”)

Simula o ambiente de produção, onde o frontend Angular é servido pelo backend C# — tudo em uma única URL.

**Passos:**

1. **Frontend Build** (Necessário apenas uma vez)

   - No terminal, navegue até Frontend/Korp_teste_frontend/.

   - Rode o comando 
   ```
      ng build. 
   ```
   (Isso cria a pasta dist/ que o C# precisa).

2. **Backend Run**

   Abra a solução Backend/KorpTeste.sln no Visual Studio 2022  
   - Pressione F5 para iniciar

O Visual Studio iniciará os dois microsserviços (Estoque e Faturamento) e abrirá o navegador automaticamente, por exemplo:

👉 http://localhost:5191 (carregando o frontend Angular)

---

### 🔹 2. Modo de Desenvolvimento (Separado)

Usado para desenvolvimento com hot-reload do frontend.

**Passos:**

   1. **Backend:**
   - Abra Backend/KorpTeste.sln no Visual Studio
   - Pressione **F5** para iniciar as duas APIs (Estoque e Faturamento).

   2. **Frontend:**
   - Em um terminal separado, navegue até Frontend/Korp_teste_frontend/
   - Rode o comando 
   ```
      ng serve -o
   ```
O navegador abrirá automaticamente em:  
👉 http://localhost:4200

---

## 🧠 Detalhamento Técnico (Conforme PDF)


Esta seção responde às perguntas específicas de detalhamento técnico solicitadas .

### ● Quais ciclos de vida do Angular foram utilizados?

Foram utilizados principalmente dois ciclos de vida:

* **`ngOnInit()`:** Usado em todos os componentes de página (`home.ts`, `faturamento.ts`) e no modal (`modal-edit-nota.ts`). Sua principal função foi disparar as chamadas iniciais de carregamento de dados (como `carregarProdutos()` e `carregarNotasFiscais()`) assim que o componente é criado.
* **`ngAfterViewInit()`:** Usado nas páginas `home.ts` e `faturamento.ts`. Foi essencial para conectar os componentes `MatPaginator` (Paginação). Isso é necessário porque esses elementos visuais (`@ViewChild`) só estão disponíveis *depois* que o HTML do componente é totalmente renderizado.

### ● Se foi feito uso da biblioteca RxJS e, em caso afirmativo, como?

Sim, o RxJS foi fundamental para a comunicação com o backend.

1.  **Observables:** O `HttpClient` do Angular não retorna dados diretamente; ele retorna um `Observable`. Em todos os nossos *serviços* (ex: `produto.ts`), as funções (como `getProdutos()`) retornam um `Observable`.
2.  **`.subscribe()`:** Nos *componentes* (ex: `home.ts`), usamos o método `.subscribe()` para "assinar" e "ouvir" a resposta da API assim que ela chega (ex: `this.produtoService.getProdutos().subscribe(data => ...)`).
3.  **`.pipe(catchError(...))`:** Usamos *pipes* do RxJS para tratar erros de forma reativa. Nas funções de `imprimirNota()` e `salvarProduto()`, o `catchError` foi usado para interceptar falhas da API (como "Saldo Insuficiente" ou "Código Duplicado") e exibir a mensagem de erro correta no `SnackBar`, sem quebrar a aplicação.

### ● Quais outras bibliotecas foram utilizadas e para qual finalidade

* **Backend (C#):**
    * `Microsoft.EntityFrameworkCore.Sqlite`: Driver que permitiu ao Entity Framework Core (ORM) se comunicar com os bancos de dados **SQLite** (`estoque.db` e `faturamento.db`).

    * `Microsoft.AspNetCore.SpaServices.Extensions`: Pacote utilizado para a "junção" (build de produção), permitindo que a API C# servisse os arquivos estáticos do Angular.
* **Frontend (Angular):**
    * `@angular/common/http`: Contém o `HttpClient`, usado em todos os *serviços* para fazer as chamadas de API.

    * `@angular/forms`: Contém o `FormsModule` (`[(ngModel)]`), usado para o *data binding* dos formulários.

### ● Para componentes visuais, quais bibliotecas foram utilizadas?

* **Angular Material:** Foi a biblioteca visual principal para 100% da interface, garantindo um design coeso e profissional. Os componentes mais importantes que usamos foram:
    * `MatToolbar`: A barra de cabeçalho superior.
    * `MatTabs`: O sistema de navegação por abas ("Estoque" e "Faturamento").
    * `MatCard` e `MatCardHeader`: Os "cartões" que organizam os formulários e tabelas.
    * `MatFormField`, `MatInput`, `MatSelect`: Para todos os campos de formulário (incluindo o dropdown de produtos).
    * `MatButton` e `MatIcon`: Para todos os botões (Salvar, Adicionar, Editar ✏️, Excluir 🗑️, Imprimir 🖨️, IA 🪄, etc.).
    * `MatTable` (com `MatTableDataSource`): A base para todas as nossas tabelas de dados.
    * `MatPaginator`: O paginador adicionado na base das tabelas.
    * `MatDialog`: Para o sistema de pop-up (modal) de "Editar" e "Visualizar" notas.
    * `MatSnackBar`: Para todos os pop-ups de notificação (ex: "Produto salvo!").
    * `MatProgressSpinner`: Os ícones de "loading" (ao imprimir nota ou usar a IA).

### ● Como foi realizado o gerenciamento de dependências no Golang (se aplicável)?

* Não aplicável. O backend foi desenvolvido em C#.

### ● Quais frameworks foram utilizados no Golang ou C#?

O backend foi desenvolvido em **C#** utilizando o framework **ASP.NET Core 8** (sobre o .NET 8), estruturado em uma arquitetura de Microsserviços:

🏭 **Serviço de Estoque (`Korp.Estoque.Api`)**
* Responsável por gerenciar produtos e saldos.
* Endpoints: `/api/produtos` (GET, POST, PUT, DELETE) e o endpoint de IA (`/api/produtos/sugerir-descricao`).

💰 **Serviço de Faturamento (`Korp.Faturamento.Api`)**
* Responsável por gerenciar as notas fiscais e sua lógica de negócios.
* Endpoints: `/api/notasfiscais` (GET, POST, PUT, DELETE) e o endpoint de impressão (`/api/notasfiscais/{id}/imprimir`).

### ● Como foram tratados os erros e exceções no backend?

Implementamos um tratamento de erros robusto em três níveis:

1.  **Validação de Modelo (Erro 400):** Usamos *Data Annotations* (ex: `[Required]`, `[Range]`) nos *Models* (`Produto.cs`). No início dos endpoints `POST` ou `PUT`, a verificação `if (!ModelState.IsValid)` captura dados inválidos antes de qualquer processamento.
2.  **Regras de Negócio (Erro 400, 404, 409):** O código verifica ativamente por problemas lógicos e retorna o código HTTP correto.
    * **404 (Not Found):** Se o usuário tenta editar/excluir um produto que não existe.
    * **400 (Bad Request):** Se o usuário tenta imprimir uma nota já "Fechada" ou se o estoque é insuficiente (`"Saldo insuficiente em estoque."`).
    * **409 (Conflict):** Se o usuário tenta cadastrar um produto com um código que já existe (`"Já existe um produto com este código."`).
3.  **Erros Inesperados (Erro 500):** Cada endpoint foi "envelopado" em um bloco `try-catch (Exception ex)`. Se qualquer falha inesperada ocorrer (ex: a API de IA falha, o banco de dados falha), o `catch` a captura, registra o erro no log (`_logger.LogError(ex, ...)`), e retorna um `StatusCode(500, "Erro interno...")` genérico para o usuário, protegendo a aplicação.

### ● Caso a implementação utilize C#, indicar se foi utilizado LINQ e de que forma.

Sim, LINQ foi a principal ferramenta de consulta ao banco de dados, utilizada em conjunto com o Entity Framework Core (EF Core) em todos os *Controllers*.

* **`ToListAsync()`:** Usado nos endpoints `GET` para buscar a lista completa de produtos e notas fiscais.
* **`FirstOrDefaultAsync(p => p.Codigo == ...)`:** Usado no `ProdutosController` para encontrar um produto específico pelo seu código antes de abater o saldo.
* **`AnyAsync(p => p.Codigo == ...)`:** Usado no `POST` de produtos para verificar eficientemente se um código já existia, prevenindo duplicatas.
* **`.Select(...)`:** Usado no `POST` de notas fiscais para mapear (transformar) a lista de "itens de entrada" (simples) na lista completa de "itens de entidade" (que o banco entende).
* **`FindAsync(id)`:** Usado no `GET /api/produtos/{id}` para buscar um produto pela sua chave primária.

---
## 🏆 Funcionalidades Opcionais Implementadas

Além dos requisitos obrigatórios, os 3 requisitos opcionais do PDF foram implementados:

### a. Tratamento de Concorrência

**Cenário do PDF:** "produto com saldo 1 sendo utilizado simultaneamente por duas notas."

**Solução Implementada:** O requisito foi cumprido através da lógica de negócios no endpoint de "Imprimir Nota" (`PUT /api/notasfiscais/{id}/imprimir`). O sistema não bloqueia o produto na *criação* da nota (que fica "Aberta"), mas sim no momento da *impressão* (quando o estoque é abatido), garantindo uma lógica "primeiro a chegar, primeiro a ser servido":

1.  A **Nota 4** (com 1 item) é impressa. A API de Estoque (`:5191`) verifica `Saldo (1) >= Qtd (1)`. Aprovado. O saldo é atualizado para 0. A Nota 4 é "Fechada".
2.  A **Nota 5** (com o mesmo 1 item) tenta imprimir.
3.  A API de Estoque (`:5191`) verifica `Saldo (0) >= Qtd (1)`. **Reprovado.**
4.  A API de Estoque retorna um `400 Bad Request` com a mensagem `"Saldo insuficiente em estoque."`. O frontend exibe este erro, e a Nota 5 permanece "Aberta".

### b. Uso de Inteligência Artificial

**Cenário:** "Implementar alguma funcionalidade do sistema que utilize IA."

**Solução Implementada:** Foi adicionado um botão "Sugerir Descrição" (🪄) no formulário de cadastro de produtos.

* **Como:**
    1.  O usuário digita um nome simples (ex: "Teclado").
    2.  O frontend chama um novo endpoint no backend (`POST /api/produtos/sugerir-descricao`).
    3.  O backend (C#) atua como um "intermediário seguro", armazenando a chave de API (do **Groq**) no `appsettings.Development.json` (que está no `.gitignore`).
    4.  O C# chama a API do Groq usando o modelo `llama-3.1-8b-instant`, solicitando uma descrição técnica e realista (ex: "Teclado Mecânico Gamer Redragon Kumara K552 RGB").
    5.  O frontend recebe a sugestão e a insere no campo.

### c. Implementação de Idempotência

**Cenário:** "Garantir que operações repetidas não causem efeitos colacionais indesejados."

**Solução Implementada:** A operação mais crítica do sistema (`PUT .../imprimir`) já é idempotente por design, através da verificação de status.

* **Como:** O `NotasFiscaisController` (no backend) primeiro verifica o status da nota:
    ```csharp
    if (notaFiscal.Status != NotaFiscalStatus.Aberta)
    {
        return BadRequest(new { message = "Esta nota fiscal não pode ser impressa pois já está fechada." });
    }
    ```
* Se um usuário clicar em "Imprimir" 5 vezes (devido a uma falha de rede, por exemplo), a *primeira* chamada executará a lógica (abaterá o estoque) e mudará o status para "Fechada". As 4 chamadas seguintes falharão instantaneamente nessa verificação e retornarão um erro, **impedindo o efeito colateral** (abater o estoque múltiplas vezes).


## 📂 Estrutura Geral do Projeto

A estrutura do monorepo está organizada da seguinte forma:

Korp_Teste_GuilhermeGonzaga/  
├── Backend/  
│ ├── Korp.Estoque.Api/  
│ ├── Korp.Faturamento.Api/  
│ └── KorpTeste.sln  
│  
├── Frontend/  
│ ├──  Korp_teste_frontend/  
│ ├── .angular/  
│ ├── .vscode/  
│ ├── dist/  
│ ├── node_modules/  
│ ├── public/  
│ └── src/  
├── .gitignore  
└── README.md  

## 🧑‍💻 Autor

**Guilherme Gonzaga**  
📧 gonzaga.krohling@gmail.com  
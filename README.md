# 🧾 Projeto Korp - Sistema de Notas Fiscais

**Candidato:** Guilherme Gonzaga

---

Este repositório contém a solução para o desafio técnico do "Projeto Técnico: Sistema de Emissão de Notas Fiscais", desenvolvido como uma aplicação full-stack com backend em C# (.NET) e frontend em Angular.

O projeto utiliza uma arquitetura de microsserviços no backend, conforme os requisitos do desafio.

---

## 🚀 Como Executar o Projeto

Existem duas formas de rodar a aplicação:

### 🔹 1. Modo de Produção (Recomendado – “Junção”)

Simula o ambiente de produção, onde o frontend Angular é servido pelo backend C# — tudo em uma única URL.

**Passos:**

1. **Frontend Build**

   cd Frontend/Korp_teste_frontend/
   ng build

2. **Backend Run**

   Abra a solução Backend/KorpTeste.sln no Visual Studio 2022  
   Pressione F5 para iniciar

O Visual Studio iniciará os dois microsserviços (Estoque e Faturamento) e abrirá o navegador automaticamente, por exemplo:

👉 http://localhost:5191 (carregando o frontend Angular)

---

### 🔹 2. Modo de Desenvolvimento (Separado)

Usado para desenvolvimento com hot-reload do frontend.

**Passos:**

   Backend:
   - Abra Backend/KorpTeste.sln no Visual Studio 2022
   - Pressione F5 para iniciar

   Frontend:
   cd Frontend/Korp_teste_frontend/
   ng serve -o

O navegador abrirá automaticamente em:  
👉 http://localhost:4200

---

## 🧠 Detalhamento Técnico (Conforme PDF)

### 1️⃣ Frameworks Utilizados
Backend: C# com ASP.NET Core 8 (.NET 8)  
Frontend: Angular 17 com Angular Material

---

### 2️⃣ Uso de LINQ

O Entity Framework Core foi utilizado com LINQ para consultas ao banco de dados:

- ToListAsync() → Buscar listas completas (GET)
- FirstOrDefaultAsync() → Buscar produtos específicos
- AnyAsync() → Verificar duplicatas
- Select() → Mapear DTOs para Models

---

### 3️⃣ Tratamento de Erros e Exceções

Três níveis principais:

Tipo | Código HTTP | Exemplo / Como foi tratado
------|--------------|----------------------------
Validação de Modelo | 400 | Data Annotations [Required], [Range]
Regras de Negócio | 400, 404, 409 | Estoque insuficiente, produto inexistente, duplicata
Erros Inesperados | 500 | try-catch com _logger.LogError(ex, ...)

---

### 4️⃣ Ciclos de Vida do Angular

ngOnInit() → Executa ao inicializar componentes  
Usado em home.ts, faturamento.ts e modal-edit-nota.ts para carregar dados iniciais.

---

### 5️⃣ Microsserviços Implementados

🏭 **Estoque**  
Responsável por gerenciar produtos e quantidades disponíveis.  
Endpoints principais:  
- GET /api/produtos  
- POST /api/produtos  
- PUT /api/produtos/{id}  
- DELETE /api/produtos/{id}

💰 **Faturamento**  
Gerencia as notas fiscais e valida o estoque antes da emissão.  
Endpoints principais:  
- GET /api/notas  
- POST /api/notas  
- PUT /api/notas/{id}  
- DELETE /api/notas/{id}

---

### 6️⃣ Banco de Dados

Usado SQLite para simplificar a execução local (sem dependência de servidor externo).  
Configuração no arquivo Backend/KorpTeste/appsettings.json

{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=korp.db"
  }
}

---

### 7️⃣ Frontend Angular

**Estrutura**

src/  
├── app/  
│   ├── components/  
│   │   ├── home/  
│   │   ├── faturamento/  
│   │   └── estoque/  
│   ├── services/  
│   ├── models/  
│   └── app.module.ts  
├── assets/  
└── environments/

**Tecnologias**
- Angular Material  
- HttpClient para comunicação com API  
- Reactive Forms  
- Pipes e Directives personalizadas  

---

### 8️⃣ Execução de Testes

**Backend**  
Testes unitários com xUnit  
Comando: dotnet test  

**Frontend**  
Testes unitários com Karma/Jasmine  
Comando: ng test  

---

### 9️⃣ Tratamento de Concorrência (Bônus)

Implementado bloqueio otimista via EF Core ConcurrencyToken.  
Exemplo:

[Timestamp]  
public byte[] RowVersion { get; set; }

Assim, se dois usuários tentarem editar o mesmo produto, o segundo receberá erro 409 Conflict.

---

### 🔟 Logging e Monitoramento

- Log de exceções com ILogger no backend.  
- Mensagens de sucesso/erro visíveis via MatSnackBar no frontend.  

---

## 🧩 Extras e Melhorias Possíveis

- Adicionar testes de integração  
- Docker Compose para orquestrar backend + frontend  
- Deploy simplificado via Azure App Service ou Railway  
- Implementar autenticação JWT para acesso às APIs  

---

## 📂 Estrutura Geral do Projeto

KorpTeste/  
├── .gitignore/  
├── README.md/  
├── Backend/  
│   ├── Controllers/  
│   ├── Models/  
│   ├── Services/  
│   ├── Repositories/  
│   ├── Program.cs  
│   └── KorpTeste.sln  
└── Frontend/  
    └── Korp_teste_frontend/  
        ├── src/  
        ├── angular.json  
        ├── package.json  
        └── tsconfig.json  

---

## 🧑‍💻 Autor

**Guilherme Gonzaga**  
📧 gonzaga.krohling@gmail.com  


---

✅ Projeto desenvolvido como parte de desafio técnico para vaga de desenvolvedor full stack.

====================================================================
This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.9.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

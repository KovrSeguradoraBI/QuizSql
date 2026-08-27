-- =====================================================================
-- Quiz SQL Server - banco de perguntas inicial (PRD secao 6.8)
-- 25 perguntas de nivel basico: 8 faceis, 10 medias, 7 dificeis.
-- Idempotente: pode ser reexecutado (on conflict do update).
-- Aplicar DEPOIS de schema.sql, no SQL Editor do Supabase.
--
-- ATENCAO: o campo "topic" e usado por src/lib/badges.ts para a badge
-- "Mestre do JOIN" (procura por JOIN no topico). Manter consistente.
-- =====================================================================

insert into questions (id, difficulty, topic, type, question, options, correct_index, explanation, hint) values

-- ---------------------------------------------------------------- FACIL
('q001','facil','SELECT','multiple_choice',
 $$Qual comando e usado para recuperar dados de uma tabela no SQL Server?$$,
 $$["SELECT","GET","FETCH","PULL"]$$::jsonb, 0,
 $$O comando SELECT e usado para consultar/recuperar dados de uma ou mais tabelas.$$,
 $$E a palavra-chave mais comum em consultas.$$),

('q002','facil','FROM','multiple_choice',
 $$Qual clausula indica de qual tabela os dados serao lidos?$$,
 $$["USING","FROM","IN","AT"]$$::jsonb, 1,
 $$FROM define a origem dos dados. Ex.: SELECT nome FROM clientes.$$,
 $$Vem logo depois da lista de colunas.$$),

('q003','facil','WHERE','multiple_choice',
 $$Qual clausula filtra linhas de uma consulta?$$,
 $$["ONLY","FILTER","WHERE","HAVING"]$$::jsonb, 2,
 $$WHERE filtra linhas individuais antes de qualquer agrupamento. HAVING filtra grupos, depois do GROUP BY.$$,
 $$Nao confunda com a clausula que filtra grupos.$$),

('q004','facil','ALIAS (AS)','multiple_choice',
 $$Como dar um apelido (alias) a uma coluna no resultado?$$,
 $$["SELECT alias(nome)","SELECT nome = cliente","SELECT nome ALIAS cliente","SELECT nome AS cliente"]$$::jsonb, 3,
 $$A palavra-chave AS cria um alias para colunas e tabelas. O AS e opcional no SQL Server, mas deixa a consulta mais legivel.$$,
 $$Sao duas letras.$$),

('q005','facil','Tipos de dados','multiple_choice',
 $$Qual tipo de dado armazena texto de tamanho variavel com suporte a Unicode?$$,
 $$["NVARCHAR","CHAR","INT","BIT"]$$::jsonb, 0,
 $$NVARCHAR guarda texto de tamanho variavel em Unicode (N = National). VARCHAR e variavel sem Unicode e CHAR tem tamanho fixo.$$,
 $$O prefixo N indica Unicode.$$),

('q006','facil','TOP','multiple_choice',
 $$Como retornar apenas as 5 primeiras linhas de uma consulta no SQL Server?$$,
 $$["SELECT * FROM clientes LIMIT 5","SELECT TOP 5 * FROM clientes","SELECT FIRST 5 * FROM clientes","SELECT * FROM clientes ROWS 5"]$$::jsonb, 1,
 $$O SQL Server usa TOP n. LIMIT e sintaxe de MySQL/PostgreSQL e nao funciona no SQL Server.$$,
 $$Nao e LIMIT - essa e de outro banco.$$),

('q007','facil','WHERE','true_false',
 $$Para comparar uma coluna com valor nulo deve-se usar IS NULL, e nao = NULL.$$,
 $$["Verdadeiro","Falso"]$$::jsonb, 0,
 $$Verdadeiro. NULL representa ausencia de valor, entao qualquer comparacao com = retorna desconhecido. Use IS NULL / IS NOT NULL.$$,
 $$NULL nao e igual a nada, nem a si mesmo.$$),

('q008','facil','Tipos de dados','true_false',
 $$O tipo BIT do SQL Server e usado para valores booleanos, aceitando 0, 1 ou NULL.$$,
 $$["Verdadeiro","Falso"]$$::jsonb, 0,
 $$Verdadeiro. O SQL Server nao tem um tipo BOOLEAN: o equivalente e BIT, que aceita 0, 1 ou NULL.$$,
 $$Pense no menor tipo numerico possivel.$$),

-- ---------------------------------------------------------------- MEDIO
('q009','medio','ORDER BY','multiple_choice',
 $$Qual clausula ordena o resultado em ordem decrescente?$$,
 $$["SORT BY preco DESC","GROUP BY preco DESC","ORDER BY preco DESC","ORDER preco DOWN"]$$::jsonb, 2,
 $$ORDER BY coluna DESC ordena do maior para o menor. Sem indicar nada, o padrao e ASC (crescente).$$,
 $$DESC vem de descending.$$),

('q010','medio','DISTINCT','multiple_choice',
 $$Qual palavra-chave remove linhas duplicadas do resultado?$$,
 $$["UNIQUE","DISTINCT","DIFFERENT","NODUP"]$$::jsonb, 1,
 $$DISTINCT elimina duplicatas considerando todas as colunas da projecao. Ex.: SELECT DISTINCT cidade FROM clientes.$$,
 $$Vem logo depois do SELECT.$$),

('q011','medio','GROUP BY','multiple_choice',
 $$Qual clausula agrupa linhas para aplicar funcoes de agregacao?$$,
 $$["PARTITION","CLUSTER BY","ORDER BY","GROUP BY"]$$::jsonb, 3,
 $$GROUP BY junta linhas com o mesmo valor em grupos, permitindo aplicar COUNT, SUM, AVG, MAX e MIN por grupo.$$,
 $$Toda coluna nao agregada precisa estar nessa clausula.$$),

('q012','medio','LIKE','multiple_choice',
 $$Qual predicado retorna os nomes que comecam com Ana?$$,
 $$["nome LIKE '%Ana'","nome CONTAINS 'Ana'","nome LIKE 'Ana%'","nome = 'Ana*'"]$$::jsonb, 2,
 $$O curinga % representa qualquer sequencia de caracteres. Colocado no fim, Ana% casa com tudo que comeca com Ana.$$,
 $$A posicao do % define onde a busca e livre.$$),

('q013','medio','IN','multiple_choice',
 $$Qual forma testa se um valor esta em uma lista de valores?$$,
 $$["status IN ('novo','pago')","status ANY ('novo','pago')","status = ('novo','pago')","status HAS ('novo','pago')"]$$::jsonb, 0,
 $$IN compara o valor com cada item da lista e equivale a varios OR encadeados.$$,
 $$Sao duas letras e a lista vem entre parenteses.$$),

('q014','medio','BETWEEN','multiple_choice',
 $$Qual expressao seleciona valores de 10 a 20, incluindo os extremos?$$,
 $$["valor BETWEEN 10 TO 20","valor RANGE 10, 20","valor IN 10..20","valor BETWEEN 10 AND 20"]$$::jsonb, 3,
 $$BETWEEN x AND y e inclusivo nos dois limites - equivale a valor >= 10 AND valor <= 20.$$,
 $$O separador dos limites e a mesma palavra do operador logico E.$$),

('q015','medio','INNER JOIN','multiple_choice',
 $$O INNER JOIN retorna quais linhas?$$,
 $$["Apenas as linhas com correspondencia nas duas tabelas","Todas as linhas da tabela da esquerda","Todas as linhas da tabela da direita","Todas as linhas das duas tabelas"]$$::jsonb, 0,
 $$O INNER JOIN mantem somente os pares que satisfazem a condicao do ON. Linhas sem correspondencia sao descartadas de ambos os lados.$$,
 $$Inner sugere apenas a intersecao.$$),

('q016','medio','ORDER BY','true_false',
 $$Sem uma clausula ORDER BY, o SQL Server nao garante a ordem das linhas retornadas.$$,
 $$["Verdadeiro","Falso"]$$::jsonb, 0,
 $$Verdadeiro. Sem ORDER BY a ordem e indefinida e pode mudar conforme plano de execucao, indices ou paralelismo. Nunca dependa dela.$$,
 $$A ordem observada em testes nao e uma garantia.$$),

('q017','medio','LIKE','multiple_choice',
 $$No operador LIKE, o que o curinga _ (sublinhado) representa?$$,
 $$["Um digito de 0 a 9","Exatamente um caractere qualquer","Qualquer sequencia de caracteres","Um espaco em branco"]$$::jsonb, 1,
 $$O _ casa com exatamente um caractere qualquer, enquanto o % casa com qualquer sequencia, incluindo vazia.$$,
 $$E o curinga mais restrito dos dois.$$),

('q018','medio','INNER JOIN','true_false',
 $$Em um JOIN, a condicao de relacionamento entre as tabelas e escrita na clausula ON.$$,
 $$["Verdadeiro","Falso"]$$::jsonb, 0,
 $$Verdadeiro. A sintaxe e FROM a INNER JOIN b ON a.id = b.a_id. A clausula ON define como as tabelas se relacionam.$$,
 $$Sao duas letras, logo depois do nome da segunda tabela.$$),

-- -------------------------------------------------------------- DIFICIL
('q019','dificil','HAVING','multiple_choice',
 $$Qual clausula filtra grupos depois de um GROUP BY?$$,
 $$["WHERE","GROUP FILTER","HAVING","FILTER"]$$::jsonb, 2,
 $$HAVING aplica o filtro sobre o resultado da agregacao. Ex.: GROUP BY cidade HAVING COUNT(*) > 10.$$,
 $$E a unica clausula que aceita funcao de agregacao no filtro.$$),

('q020','dificil','Funcoes de agregacao','multiple_choice',
 $$Qual a diferenca entre COUNT(*) e COUNT(coluna)?$$,
 $$["Sao equivalentes em qualquer situacao","COUNT(*) conta todas as linhas; COUNT(coluna) ignora os NULL","COUNT(coluna) conta todas as linhas; COUNT(*) ignora os NULL","COUNT(coluna) conta apenas valores distintos"]$$::jsonb, 1,
 $$COUNT(*) conta linhas. COUNT(coluna) conta apenas as linhas em que a coluna nao e NULL - por isso os resultados podem diferir.$$,
 $$Pense no que acontece quando a coluna esta vazia.$$),

('q021','dificil','Funcoes de agregacao','multiple_choice',
 $$Qual funcao de agregacao retorna a media dos valores de uma coluna?$$,
 $$["MEAN","MID","AVG","SUM"]$$::jsonb, 2,
 $$AVG calcula a media aritmetica, ignorando valores NULL. SUM soma e MEAN nao existe no SQL Server.$$,
 $$Abreviacao de average.$$),

('q022','dificil','Funcoes de agregacao','multiple_choice',
 $$Qual funcao retorna o maior valor de uma coluna?$$,
 $$["MAX","TOP","HIGH","GREATEST"]$$::jsonb, 0,
 $$MAX retorna o maior valor da coluna. TOP limita a quantidade de linhas e nao e funcao de agregacao.$$,
 $$Nao confunda com a clausula que limita linhas.$$),

('q023','dificil','LEFT JOIN','multiple_choice',
 $$O que o LEFT JOIN retorna?$$,
 $$["Somente as linhas com correspondencia nas duas tabelas","Todas as linhas da tabela da direita, com NULL do outro lado","Todas as linhas da tabela da esquerda, com NULL onde nao houver correspondencia","Somente as linhas sem correspondencia"]$$::jsonb, 2,
 $$O LEFT JOIN preserva todas as linhas da tabela da esquerda. Onde nao existe par na direita, as colunas dela vem como NULL - util para achar registros orfaos.$$,
 $$Left indica qual lado e preservado por inteiro.$$),

('q024','dificil','Subquery','multiple_choice',
 $$Qual consulta retorna os produtos com preco acima da media geral?$$,
 $$["SELECT * FROM produtos WHERE preco > AVG(preco)","SELECT * FROM produtos WHERE preco > (SELECT AVG(preco) FROM produtos)","SELECT * FROM produtos HAVING preco > AVG(preco)","SELECT * FROM produtos WHERE AVG(preco) < preco GROUP BY id"]$$::jsonb, 1,
 $$A media precisa ser calculada por uma subquery, porque o WHERE nao aceita funcao de agregacao diretamente. A subquery entre parenteses devolve um valor unico usado na comparacao.$$,
 $$O WHERE nao aceita funcao de agregacao - algo precisa calcular a media antes.$$),

('q025','dificil','HAVING','true_false',
 $$O WHERE filtra linhas antes da agregacao, enquanto o HAVING filtra grupos depois dela.$$,
 $$["Verdadeiro","Falso"]$$::jsonb, 0,
 $$Verdadeiro. A ordem logica e FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY. Por isso o WHERE nao ve os resultados agregados e o HAVING ve.$$,
 $$Pense na ordem em que o banco processa a consulta.$$),

-- ================================================================
-- PERGUNTAS ADICIONAIS (60 novas, distantas das 25 anteriores)
-- ================================================================

-- ---------------------------------------------------------------- FACIL (27 novas)
('q026','facil','Operadores logicos','multiple_choice',
 $$O operador AND e usado para combinar multiplas condicoes. Qual delas retorna verdadeiro?$$,
 $$["Verdadeira AND Falsa","Falsa AND Falsa","Verdadeira AND Verdadeira","Nenhuma retorna verdadeiro"]$$::jsonb, 2,
 $$AND retorna verdadeiro apenas quando TODAS as condicoes sao verdadeiras. Se qualquer uma for falsa, o resultado e falso.$$,
 $$Ambas precisam ser verdadeiras.$$),

('q027','facil','Operadores de comparacao','multiple_choice',
 $$Qual operador testa se dois valores sao diferentes no SQL Server?$$,
 $$["==","<>","!=","~~"]$$::jsonb, 1,
 $$No SQL Server, os operadores <> ou != testam desigualdade. A sintaxe preferida e <>.$$,
 $$Sao dois caracteres, parecendo setas.$$),

('q028','facil','Operadores logicos','multiple_choice',
 $$O operador OR retorna verdadeiro quando:$$,
 $$["Todas as condicoes sao falsas","Apenas uma condicao e verdadeira","Pelo menos uma condicao e verdadeira","Nenhuma condicao e verificada"]$$::jsonb, 2,
 $$OR retorna verdadeiro se QUALQUER UMA das condicoes for verdadeira. Basta uma ser verdadeira para o resultado ser verdadeiro.$$,
 $$Pelo menos uma precisa ser verdadeira.$$),

('q029','facil','NOT','multiple_choice',
 $$O operador NOT inverte uma condicao. Qual expressao retorna registros sem vendas?$$,
 $$["SELECT * FROM clientes WHERE vendas = 0","SELECT * FROM clientes WHERE NOT vendas > 0","SELECT * FROM clientes WHERE vendas < 1","Tanto B quanto C"]$$::jsonb, 3,
 $$NOT inverte uma condicao logica. NOT (vendas > 0) equivale a vendas <= 0 ou vendas = 0 ou vendas < 1.$$,
 $$NOT pode ser colocado antes da condicao.$$),

('q030','facil','Tipos de dados','multiple_choice',
 $$Qual tipo armazena um numero inteiro sem casas decimais?$$,
 $$["DECIMAL","FLOAT","INT","MONEY"]$$::jsonb, 2,
 $$INT armazena inteiros de -2147483648 a 2147483647. DECIMAL e FLOAT aceitam casas decimais e MONEY e para moeda.$$,
 $$E uma abreviacao comum em programacao.$$),

('q031','facil','Tipos de dados','multiple_choice',
 $$Qual tipo de dado e apropriado para armazenar uma data (sem hora)?$$,
 $$["DATETIME","DATE","TIMESTAMP","TIME"]$$::jsonb, 1,
 $$DATE armazena apenas a data (YYYY-MM-DD). DATETIME inclui hora, TIMESTAMP e timestamp com fuso, e TIME so hora.$$,
 $$Comeca com a letra D.$$),

('q032','facil','CHAR vs VARCHAR','multiple_choice',
 $$Qual a diferenca entre CHAR(10) e VARCHAR(10)?$$,
 $$["Nao ha diferenca","CHAR(10) tem tamanho fixo; VARCHAR(10) e variavel","VARCHAR(10) e sempre de 10 caracteres; CHAR(10) varia","CHAR e para maiusculas; VARCHAR para minusculas"]$$::jsonb, 1,
 $$CHAR(10) sempre aloca 10 espacos (preenchendo com espacos em branco). VARCHAR(10) aloca apenas o necessario ate 10 caracteres - economiza espaco.$$,
 $$VAR significa variavel.$$),

('q033','facil','CAST','multiple_choice',
 $$Como converter o valor 123 (inteiro) para texto no SQL Server?$$,
 $$["SELECT TEXT(123)","SELECT STRING(123)","SELECT CAST(123 AS VARCHAR)","SELECT CONVERT(123 TO TEXT)"]$$::jsonb, 2,
 $$CAST e usado para conversao de tipos: CAST(valor AS tipo). Tambem existe CONVERT(), que e funcao mais antiga.$$,
 $$Sao duas palavras, separadas por AS.$$),

('q034','facil','NULL','multiple_choice',
 $$O que NULL representa em um banco de dados?$$,
 $$["O valor zero","Um valor vazio ou desconhecido","Uma sequencia de espacos","Um erro de dados"]$$::jsonb, 1,
 $$NULL representa a ausencia de valor ou um valor desconhecido - nao e zero nem vazio, e um estado especial.$$,
 $$Significa desconhecido ou faltante.$$),

('q035','facil','UNION','multiple_choice',
 $$O que o UNION faz em SQL?$$,
 $$["Une duas tabelas com JOIN","Combina resultados de duas consultas (removendo duplicatas)","Agrupa linhas com valores iguais","Separa uma coluna em multiplas colunas"]$$::jsonb, 1,
 $$UNION combina resultados de multiplas SELECT em um unico resultado, removendo linhas identicas. UNION ALL manteria as duplicatas.$$,
 $$E usado para listar resultados de multiplas consultas.$$),

('q036','facil','Alias','multiple_choice',
 $$Como dar um apelido a uma tabela em uma consulta?$$,
 $$["FROM clientes ALIAS c","FROM clientes c","FROM clientes AS (c)","FROM clientes NAMED c"]$$::jsonb, 1,
 $$Basta colocar a abreviacao depois do nome da tabela: FROM clientes c ou FROM clientes AS c. Depois usa-se c.coluna.$$,
 $$Nao precisa de parenteses.$$),

('q037','facil','Funcoes de texto','multiple_choice',
 $$Qual funcao retorna o numero de caracteres de uma string?$$,
 $$["SIZE()","LENGTH()","LEN()","COUNT()"]$$::jsonb, 2,
 $$LEN() retorna o numero de caracteres de uma string, ignorando espacos no final. Ex.: LEN('oie') retorna 3.$$,
 $$Abreviacao de length.$$),

('q038','facil','Funcoes de texto','multiple_choice',
 $$Qual funcao converte uma string para maiusculas?$$,
 $$["UPCASE()","UPPER()","UPPERCASE()","TOLOWER()"]$$::jsonb, 1,
 $$UPPER() converte para maiusculas. LOWER() faz o inverso. Nos dois casos o original nao e alterado.$$,
 $$E a palavra em ingles.$$),

('q039','facil','DISTINCT','multiple_choice',
 $$Se uma coluna tem valores 5, 5, 10, 10, 15, qual sera o resultado de SELECT DISTINCT?$$,
 $$["5, 5, 10, 10, 15","5, 10, 15","Somente 5","Erro"]$$::jsonb, 1,
 $$DISTINCT remove linhas duplicadas: cada valor unico aparece apenas uma vez no resultado.$$,
 $$Elimina repeticoes.$$),

('q040','facil','TOP','multiple_choice',
 $$O que a clausula TOP 1 retorna?$$,
 $$["A primeira linha","A ultima linha","Uma linha aleatoria","A linha com indice 1"]$$::jsonb, 0,
 $$TOP 1 retorna apenas a primeira linha. A ordem depende de ORDER BY; sem ela, e indefinida mas usualmente a fisica.$$,
 $$E a mais alta na lista.$$),

('q041','facil','Operadores logicos','true_false',
 $$Um operador AND retorna verdadeiro quando pelo menos uma das condicoes e verdadeira.$$,
 $$["Verdadeiro","Falso"]$$::jsonb, 1,
 $$Falso. AND retorna verdadeiro apenas quando TODAS as condicoes sao verdadeiras. Quando QUALQUER UMA e falsa, o resultado e falso. Voce pode estar pensando em OR.$$,
 $$AND = todas; OR = pelo menos uma.$$),

('q042','facil','Comparacao com NULL','true_false',
 $$NULL == NULL retorna verdadeiro em SQL.$$,
 $$["Verdadeiro","Falso"]$$::jsonb, 1,
 $$Falso. NULL == NULL retorna desconhecido (null), nao verdadeiro. Para testar se algo e NULL, use IS NULL.$$,
 $$NULL e um caso especial.$$),

('q043','facil','SUBSTRING','multiple_choice',
 $$Qual funcao extrai parte de uma string? Ex: 'ABCDE' -> 'CD'$$,
 $$["SLICE()","SUBSTR()","SUBSTRING()","EXTRACT()"]$$::jsonb, 2,
 $$SUBSTRING(string, inicio, comprimento) extrai uma porcao. Ex: SUBSTRING('ABCDE', 3, 2) retorna 'CD'.$$,
 $$Comeca com SUB.$$),

('q044','facil','Funcoes de texto','multiple_choice',
 $$Qual funcao converte uma string para minusculas?$$,
 $$["DOWNCASE()","LOWER()","LOWERCASE()","MIN()"]$$::jsonb, 1,
 $$LOWER() converte para minusculas. Inverso de UPPER().$$,
 $$Significa mais baixo.$$),

('q045','facil','Calculo em SELECT','multiple_choice',
 $$Qual resultado de SELECT 10 + 5 * 2?$$,
 $$["30","25","20","Erro"]$$::jsonb, 1,
 $$Respeitando precedencia: 5 * 2 = 10, depois 10 + 10 = 20. A multiplicacao e feita antes da adicao.$$,
 $$Pense em ordem de operacoes.$$),

('q046','facil','Calculo em SELECT','multiple_choice',
 $$Qual resultado de SELECT (10 + 5) * 2?$$,
 $$["30","25","20","Erro"]$$::jsonb, 0,
 $$Com parenteses: 10 + 5 = 15, depois 15 * 2 = 30. Parenteses mudam a ordem de precedencia.$$,
 $$Parenteses forçam a operacao.$$),

('q047','facil','Tipos de dados','multiple_choice',
 $$Qual tipo armazena numeros com casas decimais?$$,
 $$["INT","DECIMAL(10,2)","BIT","BIGINT"]$$::jsonb, 1,
 $$DECIMAL(precisao, escala) armazena numeros com casas decimais. Ex: DECIMAL(10,2) = ate 10 digitos, 2 casas decimais.$$,
 $$Comeca com D e e para numeros fracionarios.$$),

('q048','facil','WHERE com multiplas condicoes','multiple_choice',
 $$Como selecionar clientes que sao do estado SP E tem idade > 18?$$,
 $$["WHERE estado = 'SP' OR idade > 18","WHERE estado = 'SP' AND idade > 18","WHERE estado = 'SP' + idade > 18","WHERE (estado = 'SP') (idade > 18)"]$$::jsonb, 1,
 $$AND combina multiplas condicoes com logica E. Ambas precisam ser verdadeiras.$$,
 $$Ambas as condicoes precisam ser satisfeitas.$$),

('q049','facil','Alias de coluna','multiple_choice',
 $$SELECT preco * quantidade AS total retorna uma coluna chamada:$$,
 $$["preco * quantidade","total","Sem nome","Erro"]$$::jsonb, 1,
 $$O alias AS total nomeia a coluna calculada como 'total' no resultado.$$,
 $$AS define o nome exibido.$$),

('q050','facil','GETDATE','multiple_choice',
 $$O que GETDATE() retorna?$$,
 $$["A data de criacao do banco","A data e hora atuais do servidor","A data do ultimo acesso","O timestamp de criacao da tabela"]$$::jsonb, 1,
 $$GETDATE() retorna a data e hora atual do servidor SQL Server.$$,
 $$GET = obter; DATE = data.$$),

('q051','facil','Colunas calculadas','multiple_choice',
 $$Em SELECT 100 - desconto AS preco_final, qual e o valor de preco_final se desconto = 30?$$,
 $$["100","30","70","Erro"]$$::jsonb, 2,
 $$100 - 30 = 70. A coluna calculada e renomeada com alias AS.$$,
 $$Faca a operacao matematica.$$),

('q052','facil','Operadores de comparacao','multiple_choice',
 $$Qual operador testa se um valor e maior ou igual?$$,
 $$[">","<",">=","=<"]$$::jsonb, 2,
 $$>= testa maior ou igual. =< nao existe; o correto e <=.$$,
 $$Sao dois caracteres, maior com igual.$$),

-- ---------------------------------------------------------------- MEDIO (34 novas)
('q053','medio','UNION vs UNION ALL','multiple_choice',
 $$Qual a diferenca entre UNION e UNION ALL?$$,
 $$["Nao ha diferenca","UNION remove duplicatas; UNION ALL as mantem","UNION une horizontalmente; UNION ALL verticalmente","UNION retorna erro; UNION ALL funciona"]$$::jsonb, 1,
 $$UNION combina resultados removendo linhas identicas. UNION ALL mantem as duplicatas.$$,
 $$ALL mantem tudo.$$),

('q054','medio','CASE','multiple_choice',
 $$O que a expressao CASE WHEN THEN faz?$$,
 $$["Filtra linhas como WHERE","Cria uma condicao que retorna diferentes valores conforme o resultado","Ordena as linhas","Agrupa dados"]$$::jsonb, 1,
 $$CASE WHEN condicao THEN valor_1 ELSE valor_2 END retorna valores diferentes conforme a condicao. E como um IF na SELECT.$$,
 $$Logica condicional em coluna.$$),

('q055','medio','CASE','multiple_choice',
 $$SELECT CASE WHEN idade < 18 THEN 'Menor' ELSE 'Maior' END, o resultado para idade = 25 seria:$$,
 $$["Menor","Maior","25","Erro"]$$::jsonb, 1,
 $$idade = 25 nao e < 18, entao vai para ELSE que retorna 'Maior'.$$,
 $$Nao satisfaz a condicao, va para ELSE.$$),

('q056','medio','GROUP BY com multiplas colunas','multiple_choice',
 $$GROUP BY categoria, subcategoria agrupa por qual logica?$$,
 $$["Apenas categoria","Apenas subcategoria","Combinacao de categoria E subcategoria","Alternancia entre elas"]$$::jsonb, 2,
 $$GROUP BY categoria, subcategoria cria grupos para cada combinacao unica de categoria e subcategoria.$$,
 $$Combina multiplas colunas.$$),

('q057','medio','ORDER BY com multiplas colunas','multiple_choice',
 $$ORDER BY estado, cidade como funciona?$$,
 $$["Ordena por estado descendente, depois cidade","Ordena por estado ascendente, depois por cidade ascendente","Ordena por cidade, depois ignora estado","Erro"]$$::jsonb, 1,
 $$Ordena primeiro por estado (ASC por padrao), e dentro de cada estado, ordena por cidade.$$,
 $$Ordem primaria e secundaria.$$),

('q058','medio','COALESCE','multiple_choice',
 $$O que COALESCE(col1, col2, col3) retorna?$$,
 $$["O maior valor das tres","O primeiro valor nao-NULL","Uma media das tres","Erro"]$$::jsonb, 1,
 $$COALESCE() retorna o primeiro valor nao-NULL da lista. Se todos forem NULL, retorna NULL.$$,
 $$Procura o primeiro preenchido.$$),

('q059','medio','COALESCE','multiple_choice',
 $$Se COALESCE(NULL, NULL, 'padrao', 'outro') retorna qual valor?$$,
 $$["'outro'","NULL","'padrao'","Erro"]$$::jsonb, 2,
 $$Retorna o primeiro nao-NULL encontrado: NULL, NULL, 'padrao' -> 'padrao'. Nao continua procurando apos encontrar.$$,
 $$O primeiro preenchido satisfaz.$$),

('q060','medio','ISNULL','multiple_choice',
 $$ISNULL(coluna, 0) retorna 0 quando:$$,
 $$["A coluna tem valor 0","A coluna e NULL","Sempre","Nunca"]$$::jsonb, 1,
 $$ISNULL() retorna o segundo valor (0) se o primeiro for NULL. Se houver um valor real, retorna esse valor.$$,
 $$E um substituto para NULL.$$),

('q061','medio','EXISTS','multiple_choice',
 $$O que EXISTS verifica em SQL?$$,
 $$["Se uma tabela existe no banco","Se um valor existe em uma coluna","Se a subquery retorna pelo menos uma linha","Se uma condicao e verdadeira"]$$::jsonb, 2,
 $$EXISTS retorna verdadeiro se a subquery retorna pelo menos uma linha. E muito util em JOINs correlacionados.$$,
 $$Verifica se ha resultado.$$),

('q062','medio','NOT IN','multiple_choice',
 $$SELECT * FROM clientes WHERE cidade NOT IN ('SP', 'RJ') retorna:$$,
 $$["Clientes de SP e RJ","Clientes que nao sao de SP nem RJ","Clientes sem cidade definida","Erro"]$$::jsonb, 1,
 $$NOT IN e o inverso de IN: retorna linhas onde a coluna NAO esta na lista especificada.$$,
 $$NOT inverte a logica.$$),

('q063','medio','CROSS JOIN','multiple_choice',
 $$O que o CROSS JOIN faz?$$,
 $$["Faz o mesmo que INNER JOIN","Retorna o produto cartesiano (todas as combinacoes de linhas)","Retorna linhas sem correspondencia","Faz uma uniao de linhas"]$$::jsonb, 1,
 $$CROSS JOIN combina cada linha da primeira tabela com CADA linha da segunda - se uma tem 3 linhas e outra 4, o resultado tem 12 linhas.$$,
 $$Todas as combinacoes possiveis.$$),

('q064','medio','RIGHT JOIN','multiple_choice',
 $$RIGHT JOIN e o inverso de qual JOIN?$$,
 $$["INNER JOIN","LEFT JOIN","FULL OUTER JOIN","TOP JOIN"]$$::jsonb, 1,
 $$RIGHT JOIN retorna todas as linhas da tabela da DIREITA (com NULL a esquerda). E como LEFT JOIN, mas invertido.$$,
 $$Right = direita.$$),

('q065','medio','FULL OUTER JOIN','multiple_choice',
 $$FULL OUTER JOIN retorna:$$,
 $$["Todas as linhas da esquerda com NULL a direita","Todas as linhas da direita com NULL a esquerda","Apenas linhas com correspondencia nas duas","Todas as linhas de ambas as tabelas, com NULL onde nao houver par"]$$::jsonb, 3,
 $$FULL OUTER JOIN preserva todas as linhas de ambas as tabelas. Onde nao existe correspondencia, aquele lado vem como NULL.$$,
 $$Combina esquerda E direita por completo.$$),

('q066','medio','Multiplos JOINs','multiple_choice',
 $$SELECT * FROM a INNER JOIN b ON a.id = b.a_id INNER JOIN c ON b.id = c.b_id junta quantas tabelas?$$,
 $$["Uma","Duas","Tres","Erro"]$$::jsonb, 2,
 $$Tres tabelas: a, b e c. A clausula JOIN e encadeada - primeira junta a com b, depois resultado junta com c.$$,
 $$Conte os JOINs mais um.$$),

('q067','medio','Subquery em FROM','multiple_choice',
 $$SELECT * FROM (SELECT * FROM clientes WHERE idade > 18) AS maiores funciona?$$,
 $$["Nao, subquery em FROM e invalida","Sim, retorna maiores de idade (a subquery atua como tabela temporaria)","Apenas se usar VIEW","Nao, precisa de UNION"]$$::jsonb, 1,
 $$Sim, uma subquery pode ser usada no FROM como uma tabela derivada. E necessario dar um alias com AS.$$,
 $$Subqueries podem ser usadas em multiplos lugares.$$),

('q068','medio','Subquery em SELECT','multiple_choice',
 $$SELECT nome, (SELECT COUNT(*) FROM pedidos WHERE cliente_id = clientes.id) total FROM clientes, qual sera o resultado?$$,
 $$["Erro, subquery em SELECT nao permite correlacao","Retorna nome do cliente e total de pedidos dele (subquery correlacionada)","Retorna nomes e repetindo o mesmo valor total para todos","NULL"]$$::jsonb, 1,
 $$A subquery correlacionada usa uma coluna da consulta externa (cliente_id = clientes.id) para cada linha. Cada cliente vira com seu total.$$,
 $$Referencia a tabela externa.$$),

('q069','medio','IN com subquery','multiple_choice',
 $$SELECT * FROM clientes WHERE id IN (SELECT cliente_id FROM pedidos), qual o resultado?$$,
 $$["Todos os clientes","Apenas clientes que ja fizeram pedidos (subquery retorna lista de cliente_id)","Todos menos os que nao tiveram pedidos, com NULL","Erro"]$$::jsonb, 1,
 $$IN compara o id com a lista retornada pela subquery. Retorna clientes que fizeram pedidos.$$,
 $$A subquery retorna uma lista para comparacao.$$),

('q070','medio','NOT EXISTS','multiple_choice',
 $$SELECT * FROM clientes WHERE NOT EXISTS (SELECT 1 FROM pedidos WHERE cliente_id = clientes.id) retorna:$$,
 $$["Todos os clientes","Clientes que fazem parte de pedidos","Clientes que NAO tem pedidos (EXISTS falso)","Erro"]$$::jsonb, 2,
 $$NOT EXISTS retorna verdadeiro quando a subquery NAO retorna linhas. Util para achar registros orfaos.$$,
 $$NOT inverte o resultado.$$),

('q071','medio','HAVING com multiplas condicoes','multiple_choice',
 $$GROUP BY categoria HAVING COUNT(*) > 5 AND SUM(preco) > 1000 retorna:$$,
 $$["Categorias com mais de 5 itens","Categorias com soma de preco > 1000","Categorias que satisfazem AMBAS as condicoes","Uma delas, nao ambas"]$$::jsonb, 2,
 $$HAVING com AND verifica ambas as condicoes - categoria precisa ter mais de 5 itens E preco total > 1000.$$,
 $$AND = ambas.$$),

('q072','medio','ORDER BY com NULL','multiple_choice',
 $$ORDER BY coluna_com_null ASC coloca NULL:$$,
 $$["No final da lista","No inicio da lista","Em ordem alfabetica com outros valores","Gera erro"]$$::jsonb, 1,
 $$No SQL Server, ORDER BY ASC coloca NULL no inicio, e DESC coloca NULL no final (comportamento pode variar por banco).$$,
 $$NULL vai primeiro ou ultimo conforme a direcao.$$),

('q073','medio','AND vs OR','multiple_choice',
 $$SELECT * FROM vendas WHERE mes = 'janeiro' AND valor > 1000 OR desconto > 50 retorna:$$,
 $$["Vendas de janeiro com valor > 1000 E desconto > 50","(janeiro E valor > 1000) OU desconto > 50 (precedencia AND antes de OR)","Apenas vendas de janeiro","Erro"]$$::jsonb, 1,
 $$AND tem precedencia maior que OR. Logo: (mes='janeiro' AND valor > 1000) OR desconto > 50.$$,
 $$AND se avalia primeiro.$$),

('q074','medio','Calculo agregado com WHERE','multiple_choice',
 $$SELECT COUNT(*) FROM vendas WHERE ano = 2023 retorna:$$,
 $$["Total de vendas","Total de vendas apenas do ano 2023","NULL","Erro"]$$::jsonb, 1,
 $$O WHERE filtra antes da agregacao - COUNT() conta apenas as linhas de 2023.$$,
 $$WHERE e aplicado antes de agregar.$$),

('q075','medio','ROUND e calculos','multiple_choice',
 $$ROUND(123.456, 2) retorna qual valor?$$,
 $$["123","123.45","123.46","123.450"]$$::jsonb, 2,
 $$ROUND(valor, casas_decimais) arredonda para o numero de casas decimais especificadas. 123.456 com 2 casas = 123.46 (arredonda para cima).$$,
 $$Arredonda para o numero de casas especificado.$$),

('q076','medio','ABS','multiple_choice',
 $$ABS(-50) retorna qual valor?$$,
 $$["-50","50","0","Erro"]$$::jsonb, 1,
 $$ABS() retorna o valor absoluto (sem sinal), sempre positivo.$$,
 $$E o valor positivo equivalente.$$),

('q077','medio','MIN e MAX em SELECT','multiple_choice',
 $$SELECT MIN(salario), MAX(salario) FROM funcionarios retorna:$$,
 $$["O salario minimo e maximo de todos os funcionarios","Uma linha por funcionario","Um erro de sintaxe","NULL"]$$::jsonb, 0,
 $$MIN() e MAX() sao agregacoes que retornam o menor e maior valor da coluna em uma unica linha.$$,
 $$Agregacoes simplificadas.$$),

('q078','medio','SUM com WHERE','multiple_choice',
 $$SELECT SUM(quantidade) FROM vendas WHERE produto = 'TV', qual o resultado?$$,
 $$["Numero de tipos de produtos","Soma das quantidades vendidas de TV","Quantidade de cada venda de TV listada","Erro"]$$::jsonb, 1,
 $$SUM() soma os valores e WHERE filtra apenas as linhas onde produto = 'TV'.$$,
 $$Soma filtrada.$$),

('q079','medio','DATEDIFF','multiple_choice',
 $$DATEDIFF(day, data1, data2) retorna:$$,
 $$["A hora em que ocorreu","A diferenca em dias entre as duas datas","O nome do dia da semana","Erro"]$$::jsonb, 1,
 $$DATEDIFF(unidade, data1, data2) calcula a diferenca entre datas na unidade especificada (day, month, year, etc.).$$,
 $$Diferenca entre datas.$$),

('q080','medio','REPLACE','multiple_choice',
 $$REPLACE('Hello', 'e', 'E') retorna qual string?$$,
 $$["Hello","HEllo","HELLO","Erro"]$$::jsonb, 1,
 $$REPLACE(string, procura, substitui) troca todas as ocorrencias de 'e' por 'E'.$$,
 $$Substitui valores em string.$$),

('q081','medio','LIKE com caracteres especiais','multiple_choice',
 $$LIKE '%[0-9]%' retorna strings que contem:$$,
 $$["Qualquer caractere","Um intervalo de 0 a 9","Um digito de 0 a 9 em qualquer lugar","Erro"]$$::jsonb, 2,
 $$[0-9] dentro de LIKE significa um intervalo - qualquer digito. % antes e depois significa em qualquer lugar.$$,
 $$[intervalo] define digitos.$$),

('q082','medio','Alias em GROUP BY','multiple_choice',
 $$SELECT categoria AS cat FROM tabela GROUP BY cat funciona?$$,
 $$["Sim, alias pode ser usado no GROUP BY","Nao, GROUP BY nao aceita alias (deve referenciar nome original)","Depende do banco de dados","Gera erro"]$$::jsonb, 1,
 $$Nao, GROUP BY deve referenciar a coluna original, nao o alias. Seria GROUP BY categoria.$$,
 $$GROUP BY nao aceita alias.$$),

('q083','medio','COUNT com coluna vs COUNT(*)','multiple_choice',
 $$SELECT COUNT(coluna_com_null) retorna diferente de COUNT(*) quando:$$,
 $$["Nunca, sao equivalentes","Ha valores NULL na coluna - COUNT ignora NULL, COUNT(*) nao","A coluna tem valores duplicados","Erro"]$$::jsonb, 1,
 $$COUNT(coluna) ignora NULL. COUNT(*) conta todas as linhas, inclusive aquelas com NULL na coluna. Se ha NULL, resultados diferem.$$,
 $$COUNT(col) ignora NULL; COUNT(*) nao.$$),

('q084','medio','INSERT com DEFAULT','multiple_choice',
 $$INSERT INTO tabela (coluna1, coluna2) VALUES (1, DEFAULT) faz o que?$$,
 $$["Insere NULL em coluna2","Insere o valor padrao definido para coluna2","Gera erro","Insere string DEFAULT"]$$::jsonb, 1,
 $$DEFAULT usa o valor padrao definido na criacao da tabela para aquela coluna.$$,
 $$Usa valor padrao.$$),

-- ---------------------------------------------------------------- DIFICIL (24 novas)
('q085','dificil','Correlacao em subquery','multiple_choice',
 $$O que significa uma subquery correlacionada?$$,
 $$["Uma subquery sem colunasde saida","Uma subquery que referencia colunas da consulta externa","Uma subquery agrupada","Uma subquery com ORDER BY"]$$::jsonb, 1,
 $$Uma subquery correlacionada usa dados da consulta externa em sua WHERE/ON. Executa uma vez por linha da externa.$$,
 $$Referencia a tabela externa.$$),

('q086','dificil','CTE (WITH)','multiple_choice',
 $$WITH cte AS (SELECT ...) SELECT * FROM cte, o que CTE significa?$$,
 $$["Common Table Extension","Common Table Expression (tabela temporaria nomeada)","Common Task Execution","Erro"]$$::jsonb, 1,
 $$CTE (Common Table Expression) e uma tabela temporaria nomeada, usada apenas na consulta. Melhor legibilidade que subqueries.$$,
 $$E uma tabela temporaria.$$),

('q087','dificil','Precedencia de operadores','multiple_choice',
 $$SELECT * FROM t WHERE a = 1 OR b = 2 AND c = 3 e avaliada como:$$,
 $$["(a = 1 OR b = 2) AND c = 3","a = 1 OR (b = 2 AND c = 3)","(a = 1 OR b = 2 AND c = 3)","Erro"]$$::jsonb, 1,
 $$AND tem precedencia sobre OR. Entao b = 2 AND c = 3 e avaliado primeiro, depois OR com a = 1.$$,
 $$AND se avalia antes de OR.$$),

('q088','dificil','Window Functions - ROW_NUMBER','multiple_choice',
 $$ROW_NUMBER() OVER (ORDER BY salario DESC) atribui a cada linha:$$,
 $$["Um numero aleatorio","Um numero sequencial conforme a ordem especificada (1, 2, 3...)","O rank com empates","O numero de repeticoes"]$$::jsonb, 1,
 $$ROW_NUMBER() atribui numeros sequenciais na ordem especificada, mesmo se houver empates (diferente de RANK()).$$,
 $$Numera sequencialmente.$$),

('q089','dificil','Agregacao vs Group By','multiple_choice',
 $$SELECT COUNT(*), salario FROM funcionarios (sem GROUP BY) vai retornar:$$,
 $$["Uma linha com COUNT total e salario nulo","Uma linha por salario diferente","Erro - precisa GROUP BY para misturar agregado e coluna","Uma unica linha"]$$::jsonb, 2,
 $$Erro. Quando ha uma agregacao, todas as colunas nao-agregadas precisam estar em GROUP BY. Nao pode misturar sem agrupar.$$,
 $$Colunas nao-agregadas precisam estar no GROUP BY.$$),

('q090','dificil','Self JOIN','multiple_choice',
 $$Um SELF JOIN junta uma tabela consigo mesma. Para quais casos e util?$$,
 $$["Nunca e util","Encontrar relacionamentos dentro da mesma tabela (ex: funcionario e seu chefe)","Duplicar dados","Remover NULL"]$$::jsonb, 1,
 $$Self JOIN e util para encontrar relacionamentos hierarquicos, como funcionario -> chefe (ambos em funcionarios).$$,
 $$Tabela junta consigo mesma.$$),

('q091','dificil','GROUP BY com HAVING sem WHERE','multiple_choice',
 $$SELECT COUNT(*) AS total FROM vendas GROUP BY categoria HAVING COUNT(*) > 5 (sem WHERE) retorna:$$,
 $$["Total de todas as categorias","Categorias que aparecem mais de 5 vezes","Erro, HAVING sem WHERE e invalido","Apenas uma linha"]$$::jsonb, 1,
 $$Retorna todas as categorias que tem mais de 5 vendas. HAVING filtra grupos (nao linhas).$$,
 $$HAVING filtra grupos apos agregacao.$$),

('q092','dificil','DISTINCT com multiplas colunas','multiple_choice',
 $$SELECT DISTINCT categoria, subcategoria FROM produtos com 100 linhas retorna no maximo:$$,
 $$["100 linhas","1 linha","Tantas linhas quanto combinacoes unicas (categoria, subcategoria)","10 linhas"]$$::jsonb, 2,
 $$DISTINCT remove duplicatas considerando a combinacao de todas as colunas listadas.$$,
 $$Combiacoes unicas.$$),

('q093','dificil','UPDATE com JOIN','multiple_choice',
 $$UPDATE t1 SET t1.valor = t2.novo_valor FROM t1 INNER JOIN t2 ON t1.id = t2.id, o que faz?$$,
 $$["Insere valores","Atualiza t1 com valores de t2 onde ha correspondencia","Deleta dados","Erro"]$$::jsonb, 1,
 $$UPDATE com JOIN permite atualizar uma tabela baseado em dados de outra tabela juntada.$$,
 $$Atualiza com base em outro dados.$$),

('q094','dificil','Transacao basica','multiple_choice',
 $$BEGIN TRANSACTION / COMMIT e usado para:$$,
 $$["Agrupar multiplas operacoes em uma unidade atomica - todas completam ou nenhuma (garantindo consistencia)","Criar uma nova tabela","Deletar dados permanentemente","Criar um backup"]$$::jsonb, 0,
 $$BEGIN TRANSACTION garante que todas as operacoes ate COMMIT sao atomicas. Se houver erro, ROLLBACK desfaz tudo.$$,
 $$Agrupa operacoes atomicamente.$$),

('q095','dificil','DELETE vs TRUNCATE','multiple_choice',
 $$Qual a diferenca entre DELETE e TRUNCATE?$$,
 $$["Nao ha diferenca","DELETE remove linhas uma a uma; TRUNCATE deleta toda a tabela rapidamente (nao pode usar WHERE)","DELETE mantendo espaco; TRUNCATE libera espaco","Ambos funcionam igual"]$$::jsonb, 1,
 $$DELETE pode ter WHERE e a cada linha executa trigger. TRUNCATE deleta toda a tabela rapidamente, libera espaco, mas nao permite WHERE.$$,
 $$TRUNCATE e mais rapido.$$),

('q096','dificil','Constraint NOT NULL','multiple_choice',
 $$Uma coluna com NOT NULL pode armazenar NULL?$$,
 $$["Sim, NOT NULL e opcional","Nao, rejeitara qualquer INSERT ou UPDATE que tente colocar NULL","Apenas NULL","Depende do valor"]$$::jsonb, 1,
 $$NOT NULL e uma constraint que força a coluna ter um valor sempre - NULL nao e permitido.$$,
 $$Proibe NULL.$$),

('q097','dificil','UNIQUE constraint','multiple_choice',
 $$Uma coluna com UNIQUE pode ter dois valores iguais?$$,
 $$["Sim, UNIQUE permite repeticoes","Nao, UNIQUE garante que cada valor e unico (pode ter multiplos NULL em alguns bancos)","Apenas em colunas de texto","Depende da versao do banco"]$$::jsonb, 1,
 $$UNIQUE force cada valor a ser unico (diferente de PRIMARY KEY que tambem nao permite NULL em SQL Server).$$,
 $$Valores unicos.$$),

('q098','dificil','FOREIGN KEY','multiple_choice',
 $$Uma FOREIGN KEY garante:$$,
 $$["Que a coluna tera valores unicos","Que os valores da coluna correspondem a uma chave primaria de outra tabela (integridade referencial)","Que a coluna nao pode ser NULL","Que a coluna sera indexada"]$$::jsonb, 1,
 $$FOREIGN KEY force que o valor exista em outra tabela (integridade referencial), evitando dados orfaos.$$,
 $$Referencia outra tabela.$$),

('q099','dificil','INDEX','multiple_choice',
 $$Um INDEX em uma coluna melhora:$$,
 $$["Espaco em disco","Velocidade de busca/filtro em WHERE e JOINs (mas desacelera INSERT/UPDATE)","O backup do banco","A seguranca"]$$::jsonb, 1,
 $$INDEX acelera leitura (SELECT WHERE) mas desacelera escrita (INSERT UPDATE DELETE), pois o indice precisa ser mantido.$$,
 $$Indice acelera busca.$$),

('q100','dificil','VIEW','multiple_choice',
 $$Uma VIEW (visao) em SQL e:$$,
 $$["Um arquivo externo","Uma consulta SQL armazenada que parece uma tabela virtual","Um backup do banco","Um tipo de dados"]$$::jsonb, 1,
 $$VIEW e uma consulta SQL nomeada que pode ser consultada como se fosse uma tabela. Nao armazena dados, apenas a logica.$$,
 $$Tabela virtual.$$),

('q101','dificil','Aggregate function com NULL','multiple_choice',
 $$SELECT AVG(salario) FROM funcionarios onde um tem NULL em salario, qual o resultado?$$,
 $$["Erro","Include NULL na media (media de 2000, NULL = desconhecido)","Ignora a linha com NULL (media de apenas valores validos)","Retorna NULL"]$$::jsonb, 2,
 $$Funcoes de agregacao (AVG, SUM, COUNT(col), etc) ignoram NULL. Se todos forem NULL, retorna NULL.$$,
 $$Agregacoes ignoram NULL, exceto COUNT(*).$$),

('q102','dificil','Divisao inteira vs decimal','multiple_choice',
 $$SELECT 7 / 2 retorna qual valor no SQL Server?$$,
 $$["3.5","3","4","Erro"]$$::jsonb, 1,
 $$Se ambos operandos sao inteiros, o resultado e inteiro (truncado): 7 / 2 = 3. Para 3.5, precisaria CAST para DECIMAL/FLOAT.$$,
 $$Divisao inteira trunca.$$),

('q103','dificil','EXEC com query dinamica','multiple_choice',
 $$EXEC('SELECT * FROM ' + tabela_name) permite:$$,
 $$["Executar consultas dinamicamente (perigoso sem sanitizacao - risco SQL Injection)","Apenas consultas pre-compiladas","Nenhuma vantagem em relacao a VIEW","Erro"]$$::jsonb, 0,
 $$EXEC executa SQL dinamicamente, util mas muito perigoso se a string nao for sanitizada (SQL Injection). Evite ao maximo.$$,
 $$SQL dinamica.$$),

('q104','dificil','Ordem de execucao de clauses','multiple_choice',
 $$Qual e a ordem logica de execucao: FROM -> WHERE -> GROUP BY -> SELECT -> ORDER BY?$$,
 $$["Sim, essa e a ordem","FROM -> WHERE -> SELECT -> GROUP BY -> ORDER BY","Depende da query","FROM -> GROUP BY -> WHERE -> SELECT -> ORDER BY"]$$::jsonb, 0,
 $$Ordem correta: FROM (origem) -> WHERE (filtro de linhas) -> GROUP BY (agrupamento) -> HAVING (filtro de grupos) -> SELECT (projecao) -> ORDER BY (ordenacao).$$,
 $$Ordem em que o banco processa.$$),

('q105','dificil','UNION com tipos diferentes','multiple_choice',
 $$SELECT CAST(1 AS VARCHAR) UNION SELECT 'texto' retorna:$$,
 $$["Erro, tipos incompativeis","Uma coluna de VARCHAR com valores '1' e 'texto'","Uma coluna inteira","NULL"]$$::jsonb, 1,
 $$UNION converte tipos para um tipo comum (VARCHAR neste caso). Ambas retornam como texto.$$,
 $$Tipos sao convertidos.$$),

('q106','dificil','Subquery no HAVING','multiple_choice',
 $$GROUP BY categoria HAVING COUNT(*) > (SELECT AVG(qtd) FROM tabela_temp), qual funciona?$$,
 $$["Nao, HAVING nao permite subquery","Sim, retorna categorias cuja quantidade e maior que a media calculada pela subquery","Apenas se usar IN","Sempre gera erro"]$$::jsonb, 1,
 $$HAVING pode conter subqueries para filtros complexos em grupos.$$,
 $$Subqueries em HAVING.$$),

('q107','dificil','Precedencia com parenteses','multiple_choice',
 $$SELECT * FROM t WHERE (a = 1 OR b = 2) AND c = 3 e avaliada como:$$,
 $$["a = 1 OR (b = 2 AND c = 3)","(a = 1 OR b = 2) AND c = 3 (parenteses mudam precedencia)","Sempre a = 1 primeiro","Sem diferenca"]$$::jsonb, 1,
 $$Parenteses mudam a precedencia. Condicoes dentro sao avaliadas primeiro.$$,
 $$Parenteses forcam ordem.$$),

('q108','dificil','Null com operadores','multiple_choice',
 $$Qual expressao localiza linhas onde salario e NULL ou menor que 1000?$$,
 $$["WHERE salario < 1000 OR salario IS NULL","WHERE salario = NULL OR salario < 1000","WHERE ISNULL(salario, 0) < 1000","WHERE salario < 1000"]$$::jsonb, 0,
 $$Precisa usar IS NULL (nao = NULL). A primeira condicao e correta.$$,
 $$Combine IS NULL com OR.$$)

on conflict (id) do update set
  difficulty    = excluded.difficulty,
  topic         = excluded.topic,
  type          = excluded.type,
  question      = excluded.question,
  options       = excluded.options,
  correct_index = excluded.correct_index,
  explanation   = excluded.explanation,
  hint          = excluded.hint;

-- Conferencia rapida (deve retornar facil 8 / medio 10 / dificil 7)
-- select difficulty, count(*) from questions group by difficulty order by 1;

-- =====================================================================
-- Quiz SQL Server - banco de perguntas inicial (PRD secao 6.8)
-- 25 perguntas de nivel basico: 8 faceis, 9 medias, 8 dificeis.
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
 $$Pense na ordem em que o banco processa a consulta.$$)

on conflict (id) do update set
  difficulty    = excluded.difficulty,
  topic         = excluded.topic,
  type          = excluded.type,
  question      = excluded.question,
  options       = excluded.options,
  correct_index = excluded.correct_index,
  explanation   = excluded.explanation,
  hint          = excluded.hint;

-- Conferencia rapida (deve retornar facil 8 / medio 9 / dificil 8)
-- select difficulty, count(*) from questions group by difficulty order by 1;

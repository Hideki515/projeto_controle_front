$(document).ready(() => {
  // URL da API
  const URL_POST_EXPENSES = 'https://projeto-controle-api.onrender.com/expenses'
  const URL_GET_EXPENSES = 'https://projeto-controle-api.onrender.com/expenses/list'
  const URL_DELETE_EXPENSES = 'https://projeto-controle-api.onrender.com/expense'
  const URL_EDIT_EXPENSES = 'https://projeto-controle-api.onrender.com/expenses'

  inicializer();

  function inicializer() {
    dropdown()
    // Função de exibir modal
    displayModal();
    // Função de mascarar valor
    maskValue();
    // Função de listar despesas
    listExpenses();
    // Função de adicionar despesas
    addExpenses();
    // Função de limpar filtros
    resetFilters();
    // Função de mudar dropdown
    dropdownChange();
    // Função de deletar despesas
    deleteExpense();
  }

  function dropdown() {
    $('.ui.dropdown').dropdown();
  }

  function displayModal() {
    $('#btn-add-expenses').on('click', () => {

      $('.modal.expenses').modal('show');

    });
  }

  function maskValue() {
    $('#value-expense').mask('000.000.000,00', { reverse: true, placeholder: "000,00" });
    $('#value-expense-up').mask('000.000.000,00', { reverse: true, placeholder: "000,00" });
  }

  function listExpenses() {
    // Limpa o conteúdo atual da tabela
    $('#list-expenses').empty();

    // Captura os valores dos filtros
    const accountFilter = $('#filter-account').val();
    const monthFilter = $('#filter-month').val();
    const categoryFilter = $('#filter-category').val();

    // Cria o objeto de parâmetros para a requisição
    let filterParams = {};

    // Adiciona os filtros se selecionados
    if (accountFilter !== "Selecione a conta do gasto") {
      filterParams.conta = accountFilter;
    }
    if (monthFilter !== "Selecione o mês") {
      filterParams.mes = monthFilter;
    }
    if (categoryFilter !== "Selecione a categoria do gasto") {
      filterParams.categoria = categoryFilter;
    }

    console.log("Filtros aplicados:", filterParams); // Adiciona log para verificar os filtros

    // Faz a requisição para buscar as despesas com os filtros aplicados
    $.getJSON(URL_GET_EXPENSES, (response) => {
      let listExpenses = '';
      let filteredExpenses = response.expenses;

      // Verifica se a resposta contém despesas
      if (Array.isArray(filteredExpenses)) {

        // Filtra as despesas com base nos filtros aplicados
        if (accountFilter !== "Selecione a conta do gasto") {
          filteredExpenses = filteredExpenses.filter(expense => expense.conta === accountFilter);
        }
        if (monthFilter !== "Selecione o mês") {
          filteredExpenses = filteredExpenses.filter(expense => {
            const expenseMonth = new Date(expense.data).getMonth() + 1; // Obtém o mês da data (mes começa em 0)
            return expenseMonth === parseInt(monthFilter);
          });
        }
        if (categoryFilter !== "Selecione a categoria do gasto") {
          filteredExpenses = filteredExpenses.filter(expense => expense.categoria === categoryFilter);
        }

        // Verifica se após a filtragem existem despesas
        if (filteredExpenses.length === 0) {
          listExpenses = '<tr><td colspan="7">Nenhuma despesa encontrada para os filtros aplicados.</td></tr>';
        } else {
          filteredExpenses.forEach((expense) => {
            listExpenses += `
            <tr>
              <td data-id="${expense.id}">${expense.id}</td>
              <td data-descricao="${expense.descricao}">${expense.descricao}</td>
              <td data-data="${expense.data}">${expense.data}</td>
              <td data-valor="${expense.valor}">R$ ${expense.valor}</td>
              <td data-categoria="${expense.categoria}">${expense.categoria}</td>
              <td data-conta="${expense.conta}">${expense.conta}</td>
              <td>
                <button class="ui inverted blue button mini btn-edit-expense" data-id="${expense.id}">
                  <i class="edit icon"></i>
                </button>
                <button class="ui inverted red button mini btn-delete-expense" data-id="${expense.id}">
                  <i class="trash icon"></i>
                </button>
              </td>
            </tr>
          `;
          });
        }

        // Atualiza a tabela
        $('#list-expenses').append(listExpenses);
      } else {
        console.error("Erro: A resposta da API não contém um array válido.", response);
      }
    }).fail((jqXHR, textStatus, errorThrown) => {
      console.error("Erro na requisição: ", textStatus, errorThrown);
    });

    deleteExpense();

    editExpense();

  }

  function dropdownChange() {
    $('#filter-account, #filter-month, #filter-category').change(function () {
      listExpenses();
    });
  }

  function resetFilters() {
    $('#btn-clear-filters').on('click', () => {
      console.log('Limpar');

      $('#filter-month').dropdown('set selected', 'Selecione o mês');
      $('#filter-category').dropdown('set selected', 'Selecione a categoria do gasto');
      $('#filter-account').dropdown('set selected', 'Selecione a conta do gasto');
    });
  }

  function addExpenses() {
    $('#btn-save-expense').on('click', () => {
      let value = $("#value-expense").val();

      // Converte para o formato correto
      value = value.replace(/\./g, '').replace(',', '.'); // "1234.56"

      const data = {
        descricao: $('#description-expense').val(),
        data: $('#date-expense').val(),
        valor: parseFloat(value), // Converte para número real
        categoria: $("#category-expense").val().toLowerCase(),
        conta: $("#account-expense").val().toLowerCase()
      };

      if (!data.descricao || !data.data || isNaN(data.valor) || data.categoria === 'selecione a categoria do gasto' || data.conta === 'selecione a conta da receita') {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Preencha todos os campos corretamente.",
        });
      } else if (!dateValider(data.data)) {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Data inválida",
        });
      } else {
        $.ajax({
          type: 'POST',
          url: URL_POST_EXPENSES,
          data: JSON.stringify(data),
          contentType: 'application/json',
          dataType: 'json',
          success: (data, textStatus, jqXHR) => {
            if (jqXHR.status === 201) {
              valuesReset();
              listExpenses();
              $('.ui.modal').modal('hide');
              Swal.fire({
                title: "👍😁",
                text: "Despesa Adicionada com sucesso!",
                timer: 3000,
                icon: "success",
                showConfirmButton: false,
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Erro!",
                text: "Despesa não adicionada!",
                timer: 3000,
                showConfirmButton: false,
              });
            }
          },
          error: (error) => {
            console.error('Erro:', error);
            let mensagemErro = "Ocorreu um erro ao adicionar a despesa.";
            if (error.responseJSON && error.responseJSON.message) {
              mensagemErro = error.responseJSON.message;
            } else if (error.responseText) {
              mensagemErro = error.responseText;
            }
            Swal.fire({
              icon: "error",
              title: "Erro!",
              text: mensagemErro,
            });
          }
        });
      }
    });
  }

  function editExpense() {
    $(document).off('click', '.btn-edit-expense').on('click', '.btn-edit-expense', function () {
      let line = $(this).closest('tr'); // Obtém a linha do botão clicado
      let id = $(this).data('id'); // Obtém o ID da despesa
      // Retrieve data using data attributes
      let descricao = line.find('td[data-descricao]').data('descricao');
      let data = line.find('td[data-data]').data('data');
      let valor = line.find('td[data-valor]').data('valor');
      let categoria = line.find('td[data-categoria]').data('categoria');
      let conta = line.find('td[data-conta]').data('conta');

      // Preenche os campos do modal
      $('#date-expense-up').val(data);
      $('#description-expense-up').val(descricao);
      $('#value-expense-up').val(valor);
      $('#category-expense-up').dropdown('set selected', categoria);
      $('#account-expense-up').dropdown('set selected', conta);

      // Exibe o modal
      $('.expenses-update').modal('show');

      // Atualiza a despesa
      $('#btn-save-up-expense').on('click', () => {

        $.ajax({
          type: 'PATCH',
          url: URL_EDIT_EXPENSES + '/' + id,
          data: JSON.stringify({
            descricao: $('#description-expense-up').val(),
            data: $('#date-expense-up').val(),
            valor: parseFloat($('#value-expense-up').val().replace(/\./g, '').replace(',', '.')),
            categoria: $("#category-expense-up").val().toLowerCase(),
            conta: $("#account-expense-up").val().toLowerCase()
          }),
          contentType: 'application/json',
          dataType: 'json',
          success: (data, textStatus, jqXHR) => {
            if (jqXHR.status === 200) {
              listExpenses();
              $('.expenses-update').modal('hide');
              Swal.fire({
                title: "👍😁",
                text: "Despesa atualizada com sucesso!",
                timer: 3000,
                icon: "success",
                showConfirmButton: false,
              });
            } else {
              Swal.fire({
                title: "Erro!",
                text: "Despesa não atualizada!",
                timer: 3000,
                icon: "error",
                showConfirmButton: false,
              });
            }
          },
        })

      });

    });
  }

  function deleteExpense() {
    $(document).off('click', '.btn-delete-expense').on('click', '.btn-delete-expense', function () {
      let line = $(this).closest('tr'); // Obtém a linha do botão clicado
      let id = $(this).data('id'); // Obtém o ID da despesa

      console.log("ID da despesa:", id);

      $.ajax({
        type: 'DELETE',
        url: URL_DELETE_EXPENSES + '/' + id,
        success: (data, textStatus, jqXHR) => {
          if (jqXHR.status === 200) {
            line.remove(); // Remove a linha da tabela
            Swal.fire({
              title: "👍😁",
              text: "Despesa deletada com sucesso!",
              timer: 3000,
              icon: "success",
              showConfirmButton: false,
            });
          } else {
            Swal.fire({
              title: "Erro!",
              text: "Despesa não deletada!",
              timer: 3000,
              icon: "error",
              showConfirmButton: false,
            });
          }
        },
        error: (error) => {
          console.error('Erro:', error);
          let mensagemErro = "Ocorreu um erro ao deletar a despesa.";
          if (error.responseJSON && error.responseJSON.message) {
            mensagemErro = error.responseJSON.message;
          } else if (error.responseText) {
            mensagemErro = error.responseText;
          }
          Swal.fire({
            icon: "error",
            title: "Erro!",
            text: mensagemErro,
          });
        }
      });
    });
  }

  function dateValider(data) {
    // Verifica se a data é válida e não é futura
    const dataInserida = new Date(`${data}T00:00:00`); // Adiciona T00:00:00 para evitar problemas de fuso horário.
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Zera hora, minuto, segundo e milissegundo de hoje.

    // Verifica se o objeto Date foi criado corretamente.
    if (Number.isNaN(dataInserida)) {
      return false; // Data inválida
    }

    return dataInserida <= hoje;
  }

  function valuesReset() {
    $('#description-expense').val('');
    $('#date-expense').val('');
    $('#value-expense').val('');
    $('#category-expense').dropdown('set selected', 'Selecione a categoria do gasto');
    $('#account-expense').dropdown('set selected', 'Selecione a conta da receita');


  }

});
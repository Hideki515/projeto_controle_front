$(document).ready(() => {

  const URL_POST_EXPENSES = 'http://localhost:2222/expenses'
  const URL_GET_EXPENSES = 'http://localhost:2222/expenses/list'

  inicializer();

  function inicializer() {
    // Função de exibir modal
    displayModal();
    // Função de mascarar valor
    maskValue();
    // Função de adicionar despesas
    addExpenses();
  }

  function displayModal() {
    $('#btn-add-expenses').on('click', () => {

      $('.modal.expenses').modal('show');

    });
  }

  function maskValue() {
    $('#value-expense').mask('000.000.000,00', { reverse: true, placeholder: "000,00" });
  };

  function addExpenses() {

    $('#btn-save-expense').on('click', () => {
      const data = {
        descricao: $('#description-expense').val(),
        data: $('#date-expense').val(),
        valor: $("#value-expense").val(),
        categoria: $("#category-expense").val().toLowrCase(),
        conta: $("#account-expense").val().toLowrCase()
      };

      if (!data.descricao || !data.data || !data.valor || data.categoria === 'selecione a categoria do gasto' || data.conta === 'selecione a conta da receita') {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Preencha todos os campos",
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
              $('.ui.modal').modal('hide');
              Swal.fire({
                title: "👍😁",
                text: "Despesa adicionada com sucesso!",
                timer: 3000,
                icon: "success",
                showConfirmButton: false,
              });
            } else {
              Swal.fire({
                title: "Erro!",
                text: "Despesa não cadastrada!",
                timer: 3000,
                icon: "error",
                showConfirmButton: false,
              });
            }
          },
          error: (error) => {
            console.error('Erro:', error);
            let mensagemErro = "Ocorreu um erro ao adicionar a despesa.";
            // biome-ignore lint/complexity/useOptionalChain: <explanation>
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
    $('#category-expense').val('Selecione a categoria do gasto');
    $('#account-expense').val('Selecione a conta da receita');
  }

});
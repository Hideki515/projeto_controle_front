$(document).ready(function () {

  // URL da API
  const URL_POST_REVENUS = 'https://projeto-controle-api.onrender.com/revenues';

  inicilaiza();

  function inicilaiza() {

    displayModal();
    maskValue();
    addRevenues();
  };

  function displayModal() {
    $('#btn-add-revenues').on('click', () => {

      console.log('Clicou no botão de adicionar receita');

      $('.modal.revenues').modal('show');

    });
  }

  function maskValue() {
    $('#value-revenue').mask('000.000.000,00', { reverse: true, placeholder: "000,00" });
  };

  function addRevenues() {

    $('#btn-save-revenues').on('click', () => {

      const data = {
        descricao: $('#description-revenue').val(),
        data: $('#date-revenue').val(),
        valor: $('#value-revenue').val(),
        conta: $('#account-revenue').val()
      }

      if (!data.descricao || !data.data || !data.valor || !data.conta) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Preencha todos os campos!',
        })
      } else if (!dateValider(data.data)) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Data inválida!',
        })
      } else {
        console.log('Data', data);

        $.ajax({
          type: 'POST',
          url: URL_POST_REVENUS,
          data: JSON.stringify(data),
          contentType: 'application/json',
          dataType: 'json',
          success: (data, textStatus, jqXHR) => {
            if (jqXHR.status === 201) {
              $('.ui.modal').modal('hide');
              Swal.fire({
                title: "👍😁",
                text: "Receita Adicionada com sucesso!",
                timer: 3000,
                icon: "success",
                showConfirmButton: false,
              });
            } else {
              Swal.fire({
                icon: "error",
                title: "Erro!",
                text: "Receita não adicionada!",
                timer: 3000,
                showConfirmButton: false,
              });
            }
          },
          error: (error) => {
            console.error('Erro:', error);
            let mensagemErro = "Ocorreu um erro ao adicionar a Receita.";
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

});
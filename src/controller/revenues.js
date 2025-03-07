$(document).ready(function () {

  // URL da API
  const URL_POST_REVENUS = 'https://projeto-controle-api.onrender.com/revenues';
  const URL_GET_REVENUS = 'https://projeto-controle-api.onrender.com/revenues/list';

  inicilaiza();

  function inicilaiza() {
    dropdown();
    displayModal();
    maskValue();
    addRevenues();
    listRevenues();
    dropdownChange();
    resetFilters();
  };

  function dropdown() {
    $('.ui.dropdown').dropdown();
  }

  function dropdownChange() {
    $('#filter-account, #filter-month').change(function () {
      listRevenues();
    });
  }

  function resetFilters() {
    $('#btn-clear-filters').on('click', () => {
      console.log('Limpar');

      $('#filter-month').dropdown('set selected', 'Selecione o mês');
      $('#filter-account').dropdown('set selected', 'Selecione a conta');
    });
  }

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

  function listRevenues() {
    // Limpa o conteúdo atual da tabela
    $('#list-revenues').empty();

    // Captura os valores dos filtros
    const accountFilter = $('#filter-account').val();
    const monthFilter = $('#filter-month').val();

    let filterParams = {};

    // Adiciona os filtros somente se houver valor válido
    if (accountFilter && accountFilter !== "Selecione a conta") {
      filterParams.conta = accountFilter;
    }
    if (monthFilter && monthFilter !== "Selecione o mês") {
      filterParams.mes = parseInt(monthFilter, 10); // Converte para número
    }

    console.log('Filtros aplicados:', filterParams);

    $.getJSON(URL_GET_REVENUS, (response) => {
      console.log("Resposta da API:", response); // Log para verificar os dados recebidos

      let listRevenues = '';
      let filteredRevenues = response.revenues;

      if (Array.isArray(filteredRevenues)) {
        console.log("Receitas antes da filtragem:", filteredRevenues); // Log antes de filtrar

        // Filtra somente se os filtros tiverem valor válido
        if (filterParams.conta) {
          filteredRevenues = filteredRevenues.filter(revenue => {
            console.log(`Comparando conta: ${revenue.conta} === ${filterParams.conta}`);
            return revenue.conta === filterParams.conta;
          });
        }

        if (filterParams.mes) {
          filteredRevenues = filteredRevenues.filter(revenue => {
            const revenueMonth = new Date(revenue.data).getMonth() + 1; // Obtém o mês
            console.log(`Comparando mês: ${revenueMonth} === ${filterParams.mes}`);
            return revenueMonth === filterParams.mes;
          });
        }

        console.log("Receitas após filtragem:", filteredRevenues); // Log após a filtragem

        // Verifica se há receitas após a filtragem
        if (filteredRevenues.length === 0) {
          listRevenues = '<tr><td colspan="5">Nenhuma receita encontrada para os filtros aplicados.</td></tr>';
        } else {
          filteredRevenues.forEach((revenue) => {
            listRevenues += `
                    <tr>
                        <td data-descricao="${revenue.descricao}">${revenue.descricao}</td>
                        <td data-data="${revenue.data}">${new Date(revenue.data).toLocaleDateString('pt-BR')}</td>
                        <td data-valor="${revenue.valor}">R$ ${parseFloat(revenue.valor).toFixed(2)}</td>
                        <td data-conta="${revenue.conta}">${revenue.conta}</td>
                        <td>
                            <button class="ui inverted blue button mini btn-edit-revenue" data-id="${revenue.id}">
                                <i class="edit icon"></i>
                            </button>
                            <button class="ui inverted red button mini btn-delete-revenue" data-id="${revenue.id}">
                                <i class="trash icon"></i>
                            </button>
                        </td>
                    </tr>`;
          });
        }

        // Atualiza a tabela
        $('#list-revenues').append(listRevenues);
      } else {
        console.error("Erro: A resposta da API não contém um array válido.", response);
      }
    }).fail((jqXHR, textStatus, errorThrown) => {
      console.error("Erro na requisição: ", textStatus, errorThrown);
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
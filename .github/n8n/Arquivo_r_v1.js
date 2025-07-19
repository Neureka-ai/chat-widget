import React, { useState, useEffect } from 'react';

// Componente do Modal
// Este componente exibe os detalhes de um workflow selecionado em um pop-up.
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
const WorkflowModal = ({
  workflow,
  onClose
}) => {
  // Se nenhum workflow for selecionado, não renderiza nada.
  if (!workflow) return null;

  // Função para abrir o link do workflow no GitHub em uma nova aba.
  const handleViewOnGitHub = () => {
    window.open(workflow.jsonUrl, '_blank', 'noopener,noreferrer');
  };

  // Função para baixar o arquivo JSON do workflow.
  // **CORREÇÃO**: Alterada para usar fetch e Blob para um download mais confiável.
  const handleDownload = async () => {
    // Converte a URL do GitHub para a URL de conteúdo bruto para download direto.
    const rawUrl = workflow.jsonUrl.replace('github.com', 'raw.githubusercontent.com').replace('/blob', '');
    try {
      // 1. Busca o conteúdo do arquivo.
      const response = await fetch(rawUrl);
      if (!response.ok) {
        throw new Error(`A resposta da rede não foi 'ok': ${response.statusText}`);
      }
      // 2. Converte a resposta para um Blob (um objeto tipo ficheiro).
      const blob = await response.blob();
      // 3. Cria uma URL local para o Blob.
      const url = window.URL.createObjectURL(blob);

      // 4. Cria um link temporário para iniciar o download.
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${workflow.name}.json`); // Define o nome do ficheiro
      document.body.appendChild(link);
      link.click();

      // 5. Limpa o link e o objeto URL após o download.
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('O download falhou:', error);
      // Idealmente, mostraria uma notificação de erro ao utilizador aqui.
    }
  };
  return /*#__PURE__*/_jsx("div", {
    className: "fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4 font-sans",
    children: /*#__PURE__*/_jsxs("div", {
      className: "bg-gray-800 rounded-lg shadow-2xl w-full max-w-2xl max-h-full overflow-y-auto text-gray-300",
      children: [/*#__PURE__*/_jsxs("div", {
        className: "sticky top-0 bg-gray-800 px-6 py-4 border-b border-gray-700 flex justify-between items-center",
        children: [/*#__PURE__*/_jsx("h2", {
          className: "text-xl font-bold text-white",
          children: workflow.name
        }), /*#__PURE__*/_jsx("button", {
          onClick: onClose,
          className: "text-gray-400 hover:text-white text-2xl font-bold",
          children: "\xD7"
        })]
      }), /*#__PURE__*/_jsxs("div", {
        className: "p-6",
        children: [/*#__PURE__*/_jsxs("div", {
          className: "mb-6",
          children: [/*#__PURE__*/_jsx("h3", {
            className: "font-semibold text-lg text-white mb-2",
            children: "Detalhes do Workflow"
          }), /*#__PURE__*/_jsxs("div", {
            className: "grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm",
            children: [/*#__PURE__*/_jsxs("div", {
              children: [/*#__PURE__*/_jsx("strong", {
                children: "Arquivo:"
              }), " ", /*#__PURE__*/_jsx("span", {
                className: "text-gray-400",
                children: workflow.fileName
              })]
            }), /*#__PURE__*/_jsxs("div", {
              children: [/*#__PURE__*/_jsx("strong", {
                children: "Caminho:"
              }), " ", /*#__PURE__*/_jsx("span", {
                className: "text-gray-400",
                children: "/workflows/"
              })]
            })]
          })]
        }), /*#__PURE__*/_jsxs("div", {
          children: [/*#__PURE__*/_jsx("h3", {
            className: "font-semibold text-lg text-white mb-3",
            children: "A\xE7\xF5es"
          }), /*#__PURE__*/_jsxs("div", {
            className: "flex flex-col sm:flex-row gap-3",
            children: [/*#__PURE__*/_jsxs("button", {
              onClick: handleDownload,
              className: "w-full sm:w-auto flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2",
              children: ["\uD83D\uDCE5", /*#__PURE__*/_jsx("span", {
                children: "Baixar JSON"
              })]
            }), /*#__PURE__*/_jsxs("button", {
              onClick: handleViewOnGitHub,
              className: "w-full sm:w-auto flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2",
              children: [/*#__PURE__*/_jsx("svg", {
                className: "w-5 h-5",
                fill: "currentColor",
                viewBox: "0 0 24 24",
                "aria-hidden": "true",
                children: /*#__PURE__*/_jsx("path", {
                  fillRule: "evenodd",
                  d: "M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z",
                  clipRule: "evenodd"
                })
              }), /*#__PURE__*/_jsx("span", {
                children: "Ver no GitHub"
              })]
            })]
          })]
        })]
      })]
    })
  });
};

// Componente Principal da Aplicação
export default function App() {
  // Estados para gerenciar os workflows, modal, busca, carregamento e erros.
  const [workflows, setWorkflows] = useState([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Efeito para buscar os workflows da API do GitHub quando o componente é montado.
  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        // Busca o conteúdo do diretório 'workflows' no repositório especificado.
        const response = await fetch('https://api.github.com/repos/Zie619/n8n-workflows/contents/workflows');
        if (!response.ok) {
          throw new Error('Falha ao buscar workflows. A API pode estar indisponível.');
        }
        const data = await response.json();

        // Mapeia e formata os dados recebidos da API.
        const workflowFiles = data.filter(file => file.name.endsWith('.json')).map(file => ({
          name: file.name.replace('.json', '').replace(/_/g, ' '),
          fileName: file.name,
          jsonUrl: file.html_url,
          size: file.size,
          // Formata a data para uma string local.
          lastUpdated: new Date(file.updated_at).toLocaleDateString()
        }));
        setWorkflows(workflowFiles);
      } catch (err) {
        setError(err.message);
        // Define dados de exemplo caso a API falhe.
        setWorkflows([{
          name: "Telegram Schedule Automation Scheduled",
          fileName: "0001_Telegram_Schedule_Automation_Scheduled.json",
          jsonUrl: "https://github.com/Zie619/n8n-workflows/blob/main/workflows/0001_Telegram_Schedule_Automation_Scheduled.json",
          size: 1024,
          lastUpdated: "15/05/2023"
        }, {
          name: "AI Customer Support Ticket Summarization",
          fileName: "0002_AI_Customer_Support_Ticket_Summarization.json",
          jsonUrl: "https://github.com/Zie619/n8n-workflows/blob/main/workflows/0002_AI_Customer_Support_Ticket_Summarization.json",
          size: 2048,
          lastUpdated: "20/06/2023"
        }]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkflows();
  }, []); // O array vazio assegura que o efeito rode apenas uma vez.

  // Filtra os workflows com base no termo de busca.
  const filteredWorkflows = workflows.filter(workflow => workflow.name.toLowerCase().includes(searchTerm.toLowerCase()) || workflow.fileName.toLowerCase().includes(searchTerm.toLowerCase()));

  // Funções para controlar a visibilidade do modal.
  const openModal = workflow => setSelectedWorkflow(workflow);
  const closeModal = () => setSelectedWorkflow(null);
  return /*#__PURE__*/_jsxs("div", {
    className: "bg-gray-900 min-h-screen text-white font-sans",
    children: [/*#__PURE__*/_jsxs("header", {
      className: "text-center py-12 px-4",
      children: [/*#__PURE__*/_jsx("h1", {
        className: "text-5xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500",
        children: "Diret\xF3rio de Workflows n8n"
      }), /*#__PURE__*/_jsxs("p", {
        className: "text-lg text-gray-400 max-w-2xl mx-auto",
        children: ["Navegue e baixe ", workflows.length, "+ workflows do reposit\xF3rio n8n-workflows"]
      })]
    }), /*#__PURE__*/_jsxs("main", {
      className: "container mx-auto px-4 pb-12",
      children: [/*#__PURE__*/_jsx("div", {
        className: "mb-8 max-w-3xl mx-auto",
        children: /*#__PURE__*/_jsx("input", {
          type: "text",
          placeholder: "Buscar workflows por nome...",
          className: "w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow",
          value: searchTerm,
          onChange: e => setSearchTerm(e.target.value)
        })
      }), isLoading ? /*#__PURE__*/_jsxs("div", {
        className: "text-center py-12",
        children: [/*#__PURE__*/_jsx("div", {
          className: "inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"
        }), /*#__PURE__*/_jsx("p", {
          className: "mt-4 text-gray-400",
          children: "Carregando workflows..."
        })]
      }) : error ? /*#__PURE__*/_jsxs("div", {
        className: "text-center py-12 text-yellow-400 bg-yellow-900/50 rounded-lg max-w-3xl mx-auto p-4",
        children: [/*#__PURE__*/_jsxs("p", {
          className: "font-bold",
          children: ["Erro ao carregar workflows: ", error]
        }), /*#__PURE__*/_jsx("p", {
          className: "text-gray-400 mt-2",
          children: "Mostrando workflows de exemplo."
        })]
      }) : filteredWorkflows.length === 0 ? /*#__PURE__*/_jsxs("div", {
        className: "text-center py-12 text-gray-500",
        children: ["Nenhum workflow encontrado para \"", searchTerm, "\""]
      }) :
      /*#__PURE__*/
      // Grade de workflows
      _jsx("div", {
        className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
        children: filteredWorkflows.map(workflow => /*#__PURE__*/_jsxs("div", {
          className: "bg-gray-800 rounded-lg shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 p-6 flex flex-col hover:-translate-y-1",
          children: [/*#__PURE__*/_jsx("h3", {
            className: "text-lg font-bold text-white mb-2 truncate",
            title: workflow.name,
            children: workflow.name
          }), /*#__PURE__*/_jsx("p", {
            className: "text-gray-400 text-sm mb-4 truncate",
            title: workflow.fileName,
            children: workflow.fileName
          }), /*#__PURE__*/_jsxs("div", {
            className: "flex justify-between text-xs text-gray-500 mb-6",
            children: [/*#__PURE__*/_jsxs("span", {
              children: [(workflow.size / 1024).toFixed(2), " KB"]
            }), /*#__PURE__*/_jsxs("span", {
              children: ["Atualizado: ", workflow.lastUpdated]
            })]
          }), /*#__PURE__*/_jsx("button", {
            onClick: () => openModal(workflow),
            className: "mt-auto bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg w-full transition-colors duration-200",
            children: "Ver Detalhes"
          })]
        }, workflow.fileName))
      })]
    }), /*#__PURE__*/_jsx("footer", {
      className: "text-center py-6 border-t border-gray-800 mt-12",
      children: /*#__PURE__*/_jsxs("p", {
        className: "text-gray-500",
        children: ["Fonte: ", /*#__PURE__*/_jsx("a", {
          href: "https://github.com/Zie619/n8n-workflows/tree/main/workflows",
          className: "text-indigo-400 hover:underline",
          target: "_blank",
          rel: "noopener noreferrer",
          children: "Reposit\xF3rio n8n-workflows no GitHub"
        })]
      })
    }), /*#__PURE__*/_jsx(WorkflowModal, {
      workflow: selectedWorkflow,
      onClose: closeModal
    })]
  });
}

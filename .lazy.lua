return {
  {
    "neovim/nvim-lspconfig",
    opts = {
      servers = {
        tsc = { enabled = false },
        vtsls = { enabled = true },
      },
    },
  },
}

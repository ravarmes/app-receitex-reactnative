#!/bin/bash

# Script para renomear o pacote Android
# De com.alomundoadsreactnativecli para com.frase.me

# Criar novos diretórios
mkdir -p android/app/src/main/java/com/frase/me

# Copiar os arquivos Java existentes
cp android/app/src/main/java/com/alomundoadsreactnativecli/*.java android/app/src/main/java/com/frase/me/

# Modificar os arquivos Java para usar o novo pacote
sed -i 's/package com.alomundoadsreactnativecli;/package com.frase.me;/g' android/app/src/main/java/com/frase/me/*.java

echo "Arquivos Java copiados e atualizados com o novo pacote."
echo "Importante: Você precisa verificar manualmente os arquivos em android/app/src/main/java/com/frase/me/"
echo "Você ainda precisa excluir o diretório antigo após verificar que tudo está funcionando." 
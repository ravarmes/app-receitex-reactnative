# react-native-html-to-pdf usa o JP2Decoder apenas quando disponível
-dontwarn com.gemalto.jp2.JP2Decoder

# React Native: o R8 em fullMode (android.enableR8.fullMode=true) remove classes
# de devsupport que são carregadas via SoLoader/JNI em tempo de execução. Sem
# estas regras, o app de release lança, ao abrir:
#   FATAL EXCEPTION: create_react_context
#   java.lang.ClassNotFoundException:
#       com.facebook.react.devsupport.CxxInspectorPackagerConnection
#   em com.facebook.react.devsupport.InspectorFlags.<clinit>
# e fecha imediatamente. Mantemos o pacote devsupport e o mapeamento de So.
-keep class com.facebook.react.devsupport.** { *; }
-dontwarn com.facebook.react.devsupport.**
-keep class com.facebook.react.soloader.OpenSourceMergedSoMapping { *; }

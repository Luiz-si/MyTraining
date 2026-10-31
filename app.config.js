// O app.json continua guardando as configurações principais.
// Apenas o perfil preview-arm64 limita o APK a celulares ARM de 64 bits.
module.exports = ({ config }) => {
  if (process.env.MEUTREINO_ANDROID_ARCH !== 'arm64-v8a') return config;

  return {
    ...config,
    plugins: config.plugins.map((plugin) => {
      if (!Array.isArray(plugin) || plugin[0] !== 'expo-build-properties') return plugin;

      return [plugin[0], {
        ...plugin[1],
        android: { ...plugin[1].android, buildArchs: ['arm64-v8a'] },
      }];
    }),
  };
};

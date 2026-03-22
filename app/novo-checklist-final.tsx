import { SignaturePad } from '@/components/signature-pad';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BrandColors } from '@/constants/theme';
import * as FileSystem from 'expo-file-system/legacy';
import * as Print from 'expo-print';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import LottieView from 'lottie-react-native';
import React, { useContext, useEffect, useMemo } from 'react';
import {
  Alert,
  Animated,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChecklistContext } from './context/ChecklistContext';

export default function NovoChecklistFinalScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    cliente,
    veiculo,
    placa,
    motivo,
    motivoEspecifico,
    motivoTraseira,
    motivoEspecificoTraseira,
    observacao,
    localEntregaTipo,
    localEntrega,
    opcionais,
    avarias,
    photos,
    signatureStrokes,
    setObservacao,
    setLocalEntregaTipo,
    setLocalEntrega,
    setOpcionais,
    setSignatureStrokes,
  } = useContext(ChecklistContext);

  const slideAnim = React.useRef(new Animated.Value(500)).current;
  const fadeinAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 450,
        useNativeDriver: true,
      }),
      Animated.timing(fadeinAnim, {
        toValue: 1,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeinAnim, slideAnim]);

  useEffect(() => {
    // Ao selecionar "Cliente" como local de entrega, preenche o campo com o endereço do cliente
    // mas permite editar caso esteja vazio ou precise de correção.
    if (localEntregaTipo === 'cliente' && !localEntrega) {
      setLocalEntrega(cliente?.endereco ?? '');
    }
  }, [localEntregaTipo, cliente, localEntrega, setLocalEntrega]);

  const hasValidEntrega = useMemo(() => {
    return localEntrega.trim().length > 0;
  }, [localEntrega]);

  const hasSignature = useMemo(() => {
    return signatureStrokes.some((stroke) => stroke.length > 0);
  }, [signatureStrokes]);

  const handleToggleOpcional = (key: string) => {
    setOpcionais({
      ...opcionais,
      [key]: !opcionais[key],
    });
  };

  const handleVoltar = () => {
    router.back();
  };

  const canFinalize = hasValidEntrega && hasSignature;

  const buildSignatureSvg = () => {
    const padding = 10;
    const allPoints = signatureStrokes.flat();
    if (allPoints.length === 0) return '';

    const xs = allPoints.map((p) => p.x);
    const ys = allPoints.map((p) => p.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);

    const width = Math.max(240, maxX - minX + padding * 2);
    const height = Math.max(120, maxY - minY + padding * 2);

    const paths = signatureStrokes
      .filter((stroke) => stroke.length > 0)
      .map((stroke) => {
        const points = stroke
          .map((p) => `${p.x - minX + padding},${p.y - minY + padding}`)
          .join(' ');
        return `<polyline fill="none" stroke="#0d47a1" stroke-width="3" points="${points}" />`;
      })
      .join('\n');

    return `<svg width="100%" height="auto" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" style="display:block;max-height:80px;" xmlns="http://www.w3.org/2000/svg">${paths}</svg>`;
  };

  const toDataUri = async (uri: string) => {
    if (!uri) return '';
    if (uri.startsWith('data:image/')) return uri;

    const lowerUri = uri.toLowerCase();
    const mimeType = lowerUri.endsWith('.png')
      ? 'image/png'
      : lowerUri.endsWith('.webp')
        ? 'image/webp'
        : 'image/jpeg';

    try {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });
      return `data:${mimeType};base64,${base64}`;
    } catch {
      if (uri.startsWith('content://') && FileSystem.cacheDirectory) {
        try {
          const tempPath = `${FileSystem.cacheDirectory}veicheck-photo-${Date.now()}.jpg`;
          await FileSystem.copyAsync({ from: uri, to: tempPath });
          const base64 = await FileSystem.readAsStringAsync(tempPath, {
            encoding: 'base64',
          });
          return `data:${mimeType};base64,${base64}`;
        } catch {
          return '';
        }
      }
      return '';
    }
  };

  const buildReportHtml = async () => {
    const signatureSvg = buildSignatureSvg();
    const embeddedPhotos = await Promise.all(photos.map((uri) => toDataUri(uri || '')));
    const safe = (value: string | number | null | undefined) =>
      String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');

    const clienteHtml = cliente
      ? `
        <div class="info-box">
          <h3>Cliente</h3>
          <div class="info-item"><span class="info-label">Nome:</span> <span class="info-value">${safe(cliente.nome) || '-'}</span></div>
          <div class="info-item"><span class="info-label">CPF:</span> <span class="info-value">${safe(cliente.cpf) || '-'}</span></div>
          <div class="info-item"><span class="info-label">Telefone:</span> <span class="info-value">${safe(cliente.telefone) || '-'}</span></div>
          <div class="info-item"><span class="info-label">Endereço:</span> <span class="info-value">${safe(cliente.endereco) || '-'}</span></div>
        </div>
      `
      : `
        <div class="info-box">
          <h3>Cliente</h3>
          <div class="info-item"><span class="info-label">Nome:</span> <span class="info-value">-</span></div>
          <div class="info-item"><span class="info-label">CPF:</span> <span class="info-value">-</span></div>
          <div class="info-item"><span class="info-label">Telefone:</span> <span class="info-value">-</span></div>
          <div class="info-item"><span class="info-label">Endereço:</span> <span class="info-value">-</span></div>
        </div>
      `;

    const motoristaHtml = `
      <div class="info-box">
        <h3>Motorista</h3>
        <div class="info-item"><span class="info-label">Nome:</span> <span class="info-value">-</span></div>
        <div class="info-item"><span class="info-label">CNH:</span> <span class="info-value">-</span></div>
        <div class="info-item"><span class="info-label">Telefone:</span> <span class="info-value">-</span></div>
        <div class="info-item"><span class="info-label">Dados:</span> <span class="info-value">Dados do motorista serão preenchidos no cadastro.</span></div>
      </div>
    `;

    const veiculoHtml = `
      <div class="vehicle-data">
        <h3>Dados do veículo</h3>
        <div class="value">${veiculo ? `${safe(veiculo.marca)} ${safe(veiculo.modelo)} (${safe(veiculo.ano ?? '-')})` : '-'}</div>
        <div class="vehicle-id">Placa: ${safe(placa) || '-'}</div>
      </div>
    `;

    const reasonText = [motivo, motivoEspecifico, motivoTraseira, motivoEspecificoTraseira]
      .filter((part) => !!part && part.trim().length > 0)
      .join(' | ') || '---';

    const optionalsText = [
      opcionais['avaliadoNoite'] ? 'Avaliado à noite' : '',
      opcionais['avaliadoChuva'] ? 'Avaliado na chuva' : '',
      opcionais['avaliadoSujo'] ? 'Avaliado sujo' : '',
    ]
      .filter(Boolean)
      .join(' | ') || 'Nenhuma condição especial marcada';

    const fotoItens = [
      { label: 'Frente', index: 0 },
      { label: 'Lateral Direita', index: 2 },
      { label: 'Lateral Esquerda', index: 3 },
      { label: 'Traseira', index: 1 },
      { label: 'Maleiro', index: 4 },
      { label: 'Odômetro', index: 5 },
    ];

    const photosHtml = `
      <div class="photos-grid">
        ${fotoItens
          .map((item) => {
            const uri = embeddedPhotos[item.index] || '';
            return `
              <div class="photo-item">
                <h3>${item.label}</h3>
                ${uri
                  ? `<img src="${uri}" class="photo-image" alt="${item.label}" />`
                  : '<div class="photo-placeholder">SEM FOTO</div>'}
              </div>
            `;
          })
          .join('')}
      </div>
    `;

    const statusLegendHtml = `
      <div class="status-legend">
        <span><strong>S</strong> = Sim, Existente</span>
        <span><strong>I</strong> = Incompleto</span>
        <span><strong>N</strong> = Não</span>
        <span><strong>A</strong> = Avariado</span>
      </div>
    `;

    const frontItems = ['Faróis', 'Faróis Auxiliares', 'Lanterna DI', 'Lanterna E', 'Parabrisa', 'Para-choque', 'Palhetas'];
    const latDirItems = ['Retrovisor D', 'Porta D', 'Vidro D', 'Paralama D', 'Maçaneta D', 'Roda D', 'Pneu D', 'Estria lateral D'];
    const latEsqItems = ['Retrovisor E', 'Porta E', 'Vidro E', 'Paralama E', 'Maçaneta E', 'Roda E', 'Pneu E', 'Estria lateral E'];
    const traseiraItems = ['Para-choque', 'Lanterna D', 'Lanterna E', 'Limpador', 'Vidros Traseiro', 'Rabicho', 'Aerofolio', 'Capota Maritim', 'Escapamento'];
    const maleiroItems = ['Chave de Roda', 'Macaco', 'Triângulo', 'Alto Falante', 'Estepe'];
    const interiorItems = [
      'Buzina',
      'Banco Dianteiro',
      'Banco Traseiro',
      'Trava Elétricas',
      'Retrovisor Interno',
      'Carpete',
      'Teto Solar',
      'Quebra Sol',
      'Chave Ignição',
      'Luz Interna',
      'Cinto de Segurança',
      'Console Interno',
      'Alarme',
      'Alto Falante',
      'Extintor',
      'Mp3 / CD / DVD / Rádio',
      'Kit Multimídia',
      'Antena Ext.',
      'Antena Int.',
      'Tela de DVD',
    ];

    const hasStatus = (item: string, status: 'S' | 'N' | 'I' | 'A') => (avarias[item] || '').includes(status);

    const damageRow = (item: string) => {
      const statusCell = (status: 'S' | 'N' | 'I' | 'A') =>
        `<span class="status-cell ${hasStatus(item, status) ? 'active' : ''}">${status}</span>`;

      return `
        <div class="check-item">
          <div class="check-label">${safe(item)}</div>
          <div class="check-options">
            ${statusCell('S')}
            ${statusCell('N')}
            ${statusCell('I')}
            ${statusCell('A')}
          </div>
        </div>
      `;
    };

    const damageGroups = [
      { title: 'Frente', items: frontItems },
      { title: 'Lateral Direita', items: latDirItems },
      { title: 'Lateral Esquerda', items: latEsqItems },
      { title: 'Traseira', items: traseiraItems },
      { title: 'Interior', items: interiorItems },
    ];

    const maleiroHtml = `
      <div class="checks-list compact-list">
        <h3>Maleiro</h3>
        ${maleiroItems.map((item) => damageRow(item)).join('')}
      </div>
    `;

    const observationsHtml = `
      <div class="observations-section compact-observations">
        <h3>Observações</h3>
        <div class="observations-field">${safe(observacao) || '-'}</div>
      </div>
    `;

    const checksHtml = `
      <div class="checks-grid">
        ${damageGroups
          .map(
            (group) => `
              <div class="checks-list ${group.title === 'Interior' ? 'interior-list' : ''}">
                <h3>${safe(group.title)}</h3>
                ${group.items.map((item) => damageRow(item)).join('')}
              </div>
            `,
          )
          .join('')}
        <div class="stacked-column">
          ${maleiroHtml}
          ${observationsHtml}
        </div>
      </div>
    `;

    const footerHtml = `
      <div class="footer-grid">
        <div class="signature-box">
          <h3>Assinatura do cliente</h3>
          <p class="signature-note">Assinatura capturada no app.</p>
          <div class="signature-placeholder">${signatureSvg || ''}</div>
        </div>
        <div class="delivery-box">
          <h3>Local de entrega:</h3>
          <div class="delivery-field">${safe(localEntrega) || '-'}</div>
        </div>
      </div>
    `;

    const now = new Date();
    const date = now.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

    return `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Relatório de Checklist</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          @page { size: A4 portrait; margin: 6mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif; background-color: #fff; color: #1f2937; }
          .page { width: 100%; }
          .header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 6px; }
          .header h1 { font-size: 17px; color: #0f3d8a; font-weight: 800; }
          .report-date { font-size: 9px; color: #6b7280; }
          .info-section { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 6px; margin-bottom: 6px; }
          .info-box, .vehicle-data { border-radius: 4px; padding: 6px; min-height: 82px; }
          .info-box { background: #f4f6f8; border: 1px solid #e5e7eb; }
          .info-box h3, .vehicle-data h3 { font-size: 9px; font-weight: 800; text-transform: uppercase; color: #1f3f84; margin-bottom: 4px; }
          .info-item { font-size: 8px; line-height: 1.25; margin-bottom: 2px; }
          .info-label { font-weight: 700; }
          .info-value { color: #374151; word-break: break-word; }
          .vehicle-data { background: #4b5563; color: #fff; border: 1px solid #374151; }
          .vehicle-data .value { font-size: 12px; font-weight: 700; line-height: 1.2; }
          .vehicle-id { margin-top: 4px; font-size: 9px; }
          .reason-section { margin-bottom: 6px; display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
          .reason-box, .optionals-box { border: 1px solid #e5e7eb; border-radius: 4px; padding: 6px; background: #f9fafb; }
          .reason-box h2, .optionals-box h2 { font-size: 9px; font-weight: 800; margin-bottom: 3px; color: #111827; text-transform: uppercase; }
          .pill { display: inline-block; background: #facc15; color: #111827; border-radius: 999px; padding: 3px 8px; font-size: 8px; font-weight: 700; }
          .optionals-text { font-size: 8px; color: #374151; line-height: 1.2; }
          .photos-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; margin-bottom: 6px; }
          .photo-item { display: flex; flex-direction: column; align-items: center; }
          .photo-item h3 { width: 100%; text-align: center; font-size: 8px; font-weight: 700; margin-bottom: 3px; }
          .photo-placeholder, .photo-image { width: 70%; aspect-ratio: 4 / 3; height: auto; border-radius: 4px; }
          .photo-placeholder { border: 1px dashed #cbd5e1; background: #f3f4f6; color: #9ca3af; font-size: 7px; display: flex; align-items: center; justify-content: center; font-weight: 700; }
          .photo-image { object-fit: cover; border: 1px solid #d1d5db; }
          .status-legend { width: fit-content; margin: 0 auto 6px; padding: 3px 8px; border: 1px solid #9ca3af; border-radius: 3px; background: #fafafa; display: flex; justify-content: center; gap: 12px; font-size: 7px; color: #374151; }
          .checks-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; margin-bottom: 6px; }
          .checks-list { border: 1px solid #d1d5db; border-radius: 4px; padding: 5px; background: #fff; }
          .checks-list h3 { font-size: 8px; font-weight: 800; margin-bottom: 3px; color: #111827; text-transform: uppercase; }
          .interior-list { grid-column: span 1; }
          .compact-list { min-height: 0; }
          .stacked-column { display: grid; grid-template-rows: auto 1fr; gap: 6px; }
          .check-item { display: flex; align-items: center; justify-content: space-between; gap: 4px; font-size: 7.3px; padding: 1px 0; border-bottom: 1px solid #f3f4f6; }
          .check-item:last-child { border-bottom: none; }
          .check-label { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
          .check-options { display: flex; gap: 2px; flex-shrink: 0; }
          .status-cell { width: 11px; height: 11px; border: 1px solid #cbd5e1; border-radius: 2px; text-align: center; line-height: 10px; font-size: 7px; font-weight: 700; color: #4b5563; }
          .status-cell.active { background: #16a34a; border-color: #16a34a; color: #fff; }
          .observations-section { border: 1px solid #d1d5db; border-radius: 4px; padding: 6px; margin-bottom: 6px; }
          .observations-section h3 { font-size: 9px; font-weight: 800; margin-bottom: 3px; text-transform: uppercase; }
          .observations-field { min-height: 50px; border: 1px solid #e5e7eb; border-radius: 4px; padding: 6px; font-size: 8px; color: #374151; background: #fff; white-space: pre-wrap; word-break: break-word; }
          .compact-observations { margin-bottom: 0; }
          .compact-observations .observations-field { min-height: 72px; }
          .footer-grid { display: grid; grid-template-columns: 1fr 1.3fr; gap: 6px; }
          .signature-box, .delivery-box { border: 1px solid #d1d5db; border-radius: 16px; padding: 8px; min-height: 94px; }
          .signature-box h3, .delivery-box h3 { font-size: 9px; font-weight: 800; margin-bottom: 2px; }
          .signature-note { font-size: 7px; color: #6b7280; margin-bottom: 6px; }
          .signature-placeholder { width: 100%; min-height: 52px; border: 1px solid #d1d5db; border-radius: 4px; background: #f9fafb; padding: 4px; box-sizing: border-box; }
          .delivery-field { min-height: 66px; border: 1px solid #d1d5db; border-radius: 8px; background: #fff; padding: 8px; font-size: 9px; white-space: pre-wrap; word-break: break-word; }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="header">
            <h1>Relatório de Checklist</h1>
            <div class="report-date">Emitido em ${safe(date)}</div>
          </div>
          <div class="info-section">
            ${clienteHtml}
            ${motoristaHtml}
            ${veiculoHtml}
          </div>
          <div class="reason-section">
            <div class="reason-box">
              <h2>Motivo do chamado</h2>
              <span class="pill">${safe(reasonText)}</span>
            </div>
            <div class="optionals-box">
              <h2>Condições de avaliação</h2>
              <div class="optionals-text">${safe(optionalsText)}</div>
            </div>
          </div>
          ${photosHtml}
          ${statusLegendHtml}
          ${checksHtml}
          ${footerHtml}
        </div>
      </body>
      </html>
    `;
  };

  const generatePdfAndShare = async () => {
    try {
      const html = await buildReportHtml();
      const { uri } = await Print.printToFileAsync({ html });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Compartilhar relatório',
          UTI: 'com.adobe.pdf',
        });
      } else {
        Alert.alert('Aviso', 'Não foi possível compartilhar o PDF neste dispositivo.');
      }
    } catch (error) {
      console.error('Erro ao gerar PDF', error);
      Alert.alert('Erro', 'Não foi possível gerar o relatório em PDF.');
    }
  };

  const handleFinalizar = async () => {
    if (!hasValidEntrega) {
      Alert.alert('Atenção', 'Preencha o local de entrega antes de finalizar.');
      return;
    }

    if (!hasSignature) {
      Alert.alert('Atenção', 'Por favor, peça ao cliente para assinar antes de finalizar.');
      return;
    }

    await generatePdfAndShare();

    // Pode ser expandido para salvar / enviar dados.
    router.push('/');
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}> 
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: '100%', backgroundColor: '#51eb7c' }]} />
      </View>

      <Animated.View
        style={[
          styles.messageContainer,
          {
            opacity: fadeinAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}>
        <LottieView
          source={require('@/animated/Loading.json')}
          autoPlay
          loop
          style={styles.loadingAnimation}
        />
        <ThemedText style={[styles.messageText, { marginTop: 8 }]}>Falta pouco!</ThemedText>
      </Animated.View>

      <Animated.View
        style={[
          styles.contentContainer,
          {
            opacity: fadeinAnim,
            transform: [{ translateX: slideAnim }],
          },
        ]}>
        <ScrollView contentContainerStyle={styles.formContainer}>
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Obs:</ThemedText>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: detalhes, condições especiais, etc."
              value={observacao}
              onChangeText={setObservacao}
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Condições de avaliação</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>Selecione apenas se aplicável</ThemedText>
            <View style={styles.checkboxRow}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => handleToggleOpcional('avaliadoNoite')}>
                {opcionais['avaliadoNoite'] && <ThemedText style={styles.checkboxMark}>✓</ThemedText>}
              </TouchableOpacity>
              <ThemedText style={styles.checkboxLabel}>
                Veículo avaliado à noite, sem condições de avaliar riscos ou pequenas avarias na pintura
              </ThemedText>
            </View>
            <View style={styles.checkboxRow}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => handleToggleOpcional('avaliadoChuva')}>
                {opcionais['avaliadoChuva'] && <ThemedText style={styles.checkboxMark}>✓</ThemedText>}
              </TouchableOpacity>
              <ThemedText style={styles.checkboxLabel}>
                Veículo avaliado durante chuva, sem condições de avaliar riscos ou pequenas avarias na pintura
              </ThemedText>
            </View>
            <View style={styles.checkboxRow}>
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => handleToggleOpcional('avaliadoSujo')}>
                {opcionais['avaliadoSujo'] && <ThemedText style={styles.checkboxMark}>✓</ThemedText>}
              </TouchableOpacity>
              <ThemedText style={styles.checkboxLabel}>
                Veículo avaliado sujo, sem condições de avaliar riscos ou pequenas avarias na pintura
              </ThemedText>
            </View>
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Local de entrega</ThemedText>
            <View style={styles.radioRow}>
              <TouchableOpacity
                style={[
                  styles.radioOption,
                  localEntregaTipo === 'cliente' && styles.radioOptionActive,
                ]}
                onPress={() => {
                  setLocalEntregaTipo('cliente');
                  setLocalEntrega(cliente?.endereco ?? '');
                }}>
                <ThemedText
                  style={[
                    styles.radioLabel,
                    localEntregaTipo === 'cliente' && styles.radioLabelActive,
                  ]}>
                  Cliente
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.radioOption,
                  localEntregaTipo === 'outro' && styles.radioOptionActive,
                ]}
                onPress={() => setLocalEntregaTipo('outro')}>
                <ThemedText
                  style={[
                    styles.radioLabel,
                    localEntregaTipo === 'outro' && styles.radioLabelActive,
                  ]}>
                  Outro
                </ThemedText>
              </TouchableOpacity>
            </View>

            <TextInput
              style={[styles.textInput, localEntregaTipo === 'cliente' && styles.textInputDisabled]}
              value={localEntrega}
              onChangeText={setLocalEntrega}
              editable
              placeholder="Endereço de entrega"
              multiline
              textAlignVertical="top"
            />
          </View>

          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Assinatura do cliente</ThemedText>
            <ThemedText style={styles.sectionSubtitle}>
              {hasSignature
                ? 'Assinatura capturada. Toque em "Editar" para alterar.'
                : 'Nenhuma assinatura capturada ainda.'}
            </ThemedText>
            <SignaturePad
              strokes={signatureStrokes}
              onChange={() => {}}
              placeholder="Assine na tela de assinatura"
              style={styles.signaturePad}
              disabled
            />
            <View style={styles.signatureActions}>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSignatureStrokes([])}>
                <ThemedText style={styles.clearButtonText}>Limpar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.clearButton, { marginLeft: 8 }]}
                onPress={() => router.push('/novo-checklist-assinatura')}>
                <ThemedText style={styles.clearButtonText}>
                  {hasSignature ? 'Editar assinatura' : 'Assinar'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </Animated.View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={handleVoltar}>
          <ThemedText style={styles.buttonSecondaryText}>Voltar</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: BrandColors.primary, opacity: canFinalize ? 1 : 0.5 },
          ]}
          onPress={handleFinalizar}
          disabled={!canFinalize}>
          <ThemedText style={styles.buttonText}>Finalizar</ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: Platform.OS === 'ios' ? 20 : 16,
  },
  progressBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
  },
  progressBar: {
    height: '100%',
    borderRadius: 10,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  messageText: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  loadingAnimation: {
    width: 150,
    height: 150,
  },
  contentContainer: {
    flex: 1,
  },
  formContainer: {
    paddingVertical: 16,
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxMark: {
    fontSize: 16,
    color: BrandColors.primary,
  },
  checkboxLabel: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    padding: 12,
    fontSize: 14,
    minHeight: 80,
  },
  textInputDisabled: {
    opacity: 0.6,
  },
  signaturePad: {
    marginTop: 10,
    marginBottom: 10,
  },
  signatureActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 6,
  },
  clearButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  radioRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  radioOption: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  radioOptionActive: {
    borderColor: BrandColors.primary,
    backgroundColor: 'rgba(81, 235, 124, 0.12)',
  },
  radioLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  radioLabelActive: {
    color: BrandColors.primary,
  },
  buttonsContainer: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    paddingVertical: 18,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonSecondary: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  buttonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});


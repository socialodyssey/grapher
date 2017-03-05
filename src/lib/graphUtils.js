import linenos from '../data/linenos';

function get1DLine(book, line) {
  const offset = linenos
    .slice(0, book - 1)
    .reduce((a, b) => a + b, 0)

  return offset + line;
}

export function getWeight(interaction) {
  if(interaction.type === 'INR.VERBAL-NEAR' || interaction.type === 'INR.VERBAL-FAR') {
    return interaction.selection.text.length / 20;
  }

  if(interaction.type.lastIndexOf('INR') !== -1) {
    return 20;
  }

  if(interaction.type === 'COG.FAR') {
    return 10;
  }

  if(interaction.type === 'COG.NEAR' || interaction.type === 'COG.PCR') {
    return 1;
  }

  return 1;
  
}

function getTotalWeight(arr) {
  return arr
    .map(getWeight)
    .reduce((a, b) => a + b, 0);
}

function filterForLines(lines) {
  return link => {
    if (!lines) {
      return true;
    }

    const linkLine1D = get1DLine(link.book, link.selection.to_line);

    if(typeof lines === 'number') {
      return linkLine1D <= lines;
    }

    return linkLine1D >= lines.min && linkLine1D <= lines.max;
  }
}

export function mapCentralityFor(interactions) {
  return entity => {
    const outs = interactions
      .filter((link) =>
        (
          ((link.source.id || link.source) === entity.id)))

    const ins = interactions
      .filter((link) =>
        (
          ((link.target.id || link.target) === entity.id)))
    
    const alpha = 0.5;
    
    const outWeight = getTotalWeight(outs);
    const inWeight = getTotalWeight(ins);

    const outCent = outs.length;
    const inCent  = ins.length;

    const outWeighted = outCent * Math.pow((outWeight / (outCent || 1)), alpha);

    const inWeighted  = inCent * Math.pow((inWeight / (inCent || 1)), alpha);

    const totalEdges = inCent + outCent;
    const totalWeight = outWeighted + inWeighted;

    return {
      ...entity,
      centrality: {
        out:         outCent,
        in:          inCent,
        total:       outCent + inCent,
        outWeighted: Math.round(outWeighted),
        inWeighted:  Math.round(inWeighted),
        weighted:    Math.round(totalWeight)
      }
    }
  }
}

export function createCentralityGetter(interactions) {
  const calculatedLines = {};
  
  return (entity, lines) => {
    const eID     = entity._id;
    const lineKey = lines.min ? lines.min + '-' + lines.max : lines;
    
    if(!calculatedLines[eID]) {
      calculatedLines[eID] = {}
    }
    
    if(calculatedLines[eID] && calculatedLines[eID][lineKey]) {
      return calculatedLines[eID][lineKey];
    }

    const filteredInteractions = interactions
      .filter(filterForLines(lines))

    const res = mapCentralityFor(filteredInteractions)(entity)
    
    calculatedLines[eID][lineKey] = res;
    return res;
  }
}

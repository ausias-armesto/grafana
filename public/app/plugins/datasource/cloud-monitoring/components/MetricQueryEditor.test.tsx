import { render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { getDefaultTimeRange } from '@grafana/data';

import { createMockDatasource } from '../__mocks__/cloudMonitoringDatasource';
import { createMockQuery } from '../__mocks__/cloudMonitoringQuery';
import { QueryType } from '../types/query';

import { MetricQueryEditor } from './MetricQueryEditor';

jest.mock('@grafana/runtime', () => ({
  ...jest.requireActual('@grafana/runtime'),
  getTemplateSrv: () => ({
    replace: (val: string) => val,
  }),
}));

const defaultProps = {
  refId: 'A',
  customMetaData: {},
  variableOptionGroup: { options: [] },
  onChange: jest.fn(),
  onRunQuery: jest.fn(),
  query: createMockQuery(),
  datasource: createMockDatasource(),
  range: getDefaultTimeRange(),
};

describe('MetricQueryEditor', () => {
  it('renders a default time series list query', async () => {
    const onChange = jest.fn();
    const query = createMockQuery();
    // Force to populate with default values
    delete query.timeSeriesList;

    render(<MetricQueryEditor {...defaultProps} onChange={onChange} query={query} />);
    expect(onChange).toHaveBeenCalled();
  });

  it('renders a default time series query', async () => {
    const onChange = jest.fn();
    const query = createMockQuery();
    // Force to populate with default values
    delete query.timeSeriesQuery;
    query.queryType = QueryType.TIME_SERIES_QUERY;

    render(<MetricQueryEditor {...defaultProps} onChange={onChange} query={query} />);
    expect(onChange).toHaveBeenCalled();
  });

  it('renders an annotation query', async () => {
    const onChange = jest.fn();
    const query = createMockQuery();
    query.queryType = QueryType.ANNOTATION;

    render(<MetricQueryEditor {...defaultProps} onChange={onChange} query={query} />);
    const l = await screen.findByLabelText('Project');
    expect(l).toBeInTheDocument();
  });

  it('renders a Project dropdown', async () => {
    const query = createMockQuery();
    query.queryType = QueryType.TIME_SERIES_QUERY;

    render(<MetricQueryEditor {...defaultProps} />);
    const projectDropdown = await screen.findByLabelText('Project');
    expect(projectDropdown).toBeInTheDocument();
  });

  it('preserves the aliasBy property when switching between Builder and MQL queries', async () => {
    const query = createMockQuery({ aliasBy: 'AliasTest' });
    query.queryType = QueryType.TIME_SERIES_QUERY;

    render(<MetricQueryEditor {...defaultProps} query={query} />);
    await waitFor(() => expect(screen.getByLabelText('Alias by').closest('input')!.value).toEqual('AliasTest'));

    query.queryType = QueryType.TIME_SERIES_LIST;

    render(<MetricQueryEditor {...defaultProps} query={query} />);
    await waitFor(() => expect(screen.getByLabelText('Alias by').closest('input')!.value).toEqual('AliasTest'));
  });
});

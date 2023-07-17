import * as React from 'react';

import { Page } from 'app/core/components/Page/Page';
import { StoreState, useSelector } from 'app/types';

import { DataSourceAddButton } from '../components/DataSourceAddButton';
import { DataSourcesList } from '../components/DataSourcesList';
import { getDataSourcesCount } from '../state';

export function DataSourcesListPage() {
  const dataSourcesCount = useSelector(({ dataSources }: StoreState) => getDataSourcesCount(dataSources));

  const actions = dataSourcesCount > 0 ? <DataSourceAddButton /> : undefined;
  return (
    <Page navId={'connections-datasources'} actions={actions}>
      <Page.Contents>
        <DataSourcesList />
      </Page.Contents>
    </Page>
  );
}

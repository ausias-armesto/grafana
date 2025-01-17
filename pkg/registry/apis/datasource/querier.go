package datasource

import (
	"context"
	"fmt"

	"github.com/grafana/grafana-plugin-sdk-go/backend"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	common "github.com/grafana/grafana/pkg/apis/common/v0alpha1"
	"github.com/grafana/grafana/pkg/apis/datasource/v0alpha1"
	"github.com/grafana/grafana/pkg/infra/appcontext"
	"github.com/grafana/grafana/pkg/plugins"
	"github.com/grafana/grafana/pkg/services/datasources"
	"github.com/grafana/grafana/pkg/services/grafana-apiserver/endpoints/request"
	"github.com/grafana/grafana/pkg/services/grafana-apiserver/utils"
)

type QuerierFactoryFunc func(ctx context.Context, ri common.ResourceInfo, pj plugins.JSONData) (Querier, error)

type QuerierProvider interface {
	Querier(ctx context.Context, ri common.ResourceInfo, pj plugins.JSONData) (Querier, error)
}

type DefaultQuerierProvider struct {
	factory QuerierFactoryFunc
}

func ProvideDefaultQuerierProvider(pluginClient plugins.Client, dsService datasources.DataSourceService,
	dsCache datasources.CacheService) *DefaultQuerierProvider {
	return NewQuerierProvider(func(ctx context.Context, ri common.ResourceInfo, pj plugins.JSONData) (Querier, error) {
		return NewDefaultQuerier(ri, pj, pluginClient, dsService, dsCache), nil
	})
}

func NewQuerierProvider(factory QuerierFactoryFunc) *DefaultQuerierProvider {
	return &DefaultQuerierProvider{
		factory: factory,
	}
}

func (p *DefaultQuerierProvider) Querier(ctx context.Context, ri common.ResourceInfo, pj plugins.JSONData) (Querier, error) {
	return p.factory(ctx, ri, pj)
}

// Querier is the interface that wraps the Query method.
type Querier interface {
	// Query runs the query on behalf of the user in context.
	Query(ctx context.Context, query *backend.QueryDataRequest) (*backend.QueryDataResponse, error)
	// Health checks the health of the plugin.
	Health(ctx context.Context, req *backend.CheckHealthRequest) (*backend.CheckHealthResult, error)
	// Resource gets a resource plugin.
	Resource(ctx context.Context, req *backend.CallResourceRequest, sender backend.CallResourceResponseSender) error
	// Datasource gets all data source plugins (with elevated permissions).
	Datasource(ctx context.Context, name string) (*v0alpha1.DataSourceConnection, error)
	// Datasources lists all data sources (with elevated permissions).
	Datasources(ctx context.Context) (*v0alpha1.DataSourceConnectionList, error)
}

type DefaultQuerier struct {
	connectionResourceInfo common.ResourceInfo
	pluginJSON             plugins.JSONData
	pluginClient           plugins.Client
	dsService              datasources.DataSourceService
	dsCache                datasources.CacheService
}

func NewDefaultQuerier(
	connectionResourceInfo common.ResourceInfo,
	pluginJSON plugins.JSONData,
	pluginClient plugins.Client,
	dsService datasources.DataSourceService,
	dsCache datasources.CacheService,
) *DefaultQuerier {
	return &DefaultQuerier{
		connectionResourceInfo: connectionResourceInfo,
		pluginJSON:             pluginJSON,
		pluginClient:           pluginClient,
		dsService:              dsService,
		dsCache:                dsCache,
	}
}

func (q *DefaultQuerier) Query(ctx context.Context, query *backend.QueryDataRequest) (*backend.QueryDataResponse, error) {
	_, err := request.NamespaceInfoFrom(ctx, true)
	if err != nil {
		return nil, err
	}
	return q.pluginClient.QueryData(ctx, query)
}

func (q *DefaultQuerier) Resource(ctx context.Context, req *backend.CallResourceRequest, sender backend.CallResourceResponseSender) error {
	_, err := request.NamespaceInfoFrom(ctx, true)
	if err != nil {
		return err
	}
	return q.pluginClient.CallResource(ctx, req, sender)
}

func (q *DefaultQuerier) Health(ctx context.Context, query *backend.CheckHealthRequest) (*backend.CheckHealthResult, error) {
	_, err := request.NamespaceInfoFrom(ctx, true)
	if err != nil {
		return nil, err
	}
	return q.pluginClient.CheckHealth(ctx, query)
}

func (q *DefaultQuerier) Datasource(ctx context.Context, name string) (*v0alpha1.DataSourceConnection, error) {
	info, err := request.NamespaceInfoFrom(ctx, true)
	if err != nil {
		return nil, err
	}
	user, err := appcontext.User(ctx)
	if err != nil {
		return nil, err
	}
	ds, err := q.dsCache.GetDatasourceByUID(ctx, name, user, false)
	if err != nil {
		return nil, err
	}
	return asConnection(q.connectionResourceInfo.TypeMeta(), ds, info.Value)
}

func (q *DefaultQuerier) Datasources(ctx context.Context) (*v0alpha1.DataSourceConnectionList, error) {
	info, err := request.NamespaceInfoFrom(ctx, true)
	if err != nil {
		return nil, err
	}

	ds, err := q.dsService.GetDataSourcesByType(ctx, &datasources.GetDataSourcesByTypeQuery{
		OrgID: info.OrgID,
		Type:  q.pluginJSON.ID,
	})
	if err != nil {
		return nil, err
	}
	return asConnectionList(q.connectionResourceInfo.TypeMeta(), ds, info.Value)
}

func asConnection(typeMeta metav1.TypeMeta, ds *datasources.DataSource, ns string) (*v0alpha1.DataSourceConnection, error) {
	v := &v0alpha1.DataSourceConnection{
		TypeMeta: typeMeta,
		ObjectMeta: metav1.ObjectMeta{
			Name:              ds.UID,
			Namespace:         ns,
			CreationTimestamp: metav1.NewTime(ds.Created),
			ResourceVersion:   fmt.Sprintf("%d", ds.Updated.UnixMilli()),
		},
		Title: ds.Name,
	}
	v.UID = utils.CalculateClusterWideUID(v) // indicates if the value changed on the server
	meta, err := utils.MetaAccessor(v)
	if err != nil {
		meta.SetUpdatedTimestamp(&ds.Updated)
	}
	return v, err
}

func asConnectionList(typeMeta metav1.TypeMeta, dss []*datasources.DataSource, ns string) (*v0alpha1.DataSourceConnectionList, error) {
	result := &v0alpha1.DataSourceConnectionList{
		Items: []v0alpha1.DataSourceConnection{},
	}
	for _, ds := range dss {
		v, _ := asConnection(typeMeta, ds, ns)
		result.Items = append(result.Items, *v)
	}

	return result, nil
}
